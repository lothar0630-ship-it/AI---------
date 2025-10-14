#!/usr/bin/env node

/**
 * AWS Infrastructure Setup Script
 * Automates S3 bucket and CloudFront distribution creation
 */

const { execSync } = require('child_process');
const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

class AWSInfrastructureSetup {
  constructor() {
    this.config = this.loadConfig();
    this.bucketName =
      process.env.S3_BUCKET_NAME || this.config.aws.s3.bucketName;
    this.region = process.env.AWS_REGION || this.config.aws.region;
  }

  loadConfig() {
    try {
      return JSON.parse(
        readFileSync(join(__dirname, 'aws-deploy-config.json'), 'utf8')
      );
    } catch (error) {
      console.error('❌ Failed to load AWS configuration:', error.message);
      process.exit(1);
    }
  }

  async setup() {
    console.log('🚀 Setting up AWS infrastructure...');

    try {
      this.validateAWSCredentials();
      this.createS3Bucket();
      this.configureS3Website();
      this.setBucketPolicy();
      this.createCloudFrontDistribution();

      console.log('✅ AWS infrastructure setup completed successfully!');
      this.printSetupSummary();
    } catch (error) {
      console.error('❌ Infrastructure setup failed:', error.message);
      process.exit(1);
    }
  }

  validateAWSCredentials() {
    console.log('🔍 Validating AWS credentials...');

    try {
      const identity = execSync('aws sts get-caller-identity', {
        encoding: 'utf8',
      });
      const identityData = JSON.parse(identity);
      console.log(`✅ Authenticated as: ${identityData.Arn}`);
    } catch (error) {
      throw new Error(
        'AWS credentials not configured. Run "aws configure" first.'
      );
    }
  }

  createS3Bucket() {
    console.log(`🪣 Creating S3 bucket: ${this.bucketName}...`);

    try {
      // Check if bucket already exists
      execSync(`aws s3api head-bucket --bucket ${this.bucketName}`, {
        stdio: 'ignore',
      });
      console.log('✅ S3 bucket already exists');
    } catch (error) {
      // Bucket doesn't exist, create it
      try {
        if (this.region === 'us-east-1') {
          execSync(`aws s3api create-bucket --bucket ${this.bucketName}`, {
            stdio: 'inherit',
          });
        } else {
          execSync(
            `aws s3api create-bucket --bucket ${this.bucketName} --region ${this.region} --create-bucket-configuration LocationConstraint=${this.region}`,
            { stdio: 'inherit' }
          );
        }
        console.log('✅ S3 bucket created successfully');
      } catch (createError) {
        throw new Error(`Failed to create S3 bucket: ${createError.message}`);
      }
    }
  }

  configureS3Website() {
    console.log('🌐 Configuring S3 static website hosting...');

    const websiteConfig = {
      IndexDocument: { Suffix: 'index.html' },
      ErrorDocument: { Key: 'index.html' },
    };

    const configFile = '/tmp/website-config.json';
    writeFileSync(configFile, JSON.stringify(websiteConfig, null, 2));

    try {
      execSync(
        `aws s3api put-bucket-website --bucket ${this.bucketName} --website-configuration file://${configFile}`,
        { stdio: 'inherit' }
      );
      console.log('✅ S3 website hosting configured');
    } catch (error) {
      throw new Error(`Failed to configure S3 website: ${error.message}`);
    }
  }

  setBucketPolicy() {
    console.log('🔒 Setting S3 bucket policy...');

    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'PublicReadGetObject',
          Effect: 'Allow',
          Principal: '*',
          Action: 's3:GetObject',
          Resource: `arn:aws:s3:::${this.bucketName}/*`,
        },
      ],
    };

    const policyFile = '/tmp/bucket-policy.json';
    writeFileSync(policyFile, JSON.stringify(policy, null, 2));

    try {
      execSync(
        `aws s3api put-bucket-policy --bucket ${this.bucketName} --policy file://${policyFile}`,
        { stdio: 'inherit' }
      );
      console.log('✅ S3 bucket policy set');
    } catch (error) {
      throw new Error(`Failed to set bucket policy: ${error.message}`);
    }
  }

  createCloudFrontDistribution() {
    console.log('☁️  Creating CloudFront distribution...');

    const distributionConfig = {
      CallerReference: `personal-portal-${Date.now()}`,
      Comment: 'Personal Portal Site Distribution',
      DefaultCacheBehavior: {
        TargetOriginId: 'S3-personal-portal',
        ViewerProtocolPolicy: 'redirect-to-https',
        CachePolicyId: '4135ea2d-6df8-44a3-9df3-4b5a84be39ad', // Managed-CachingOptimized
        Compress: true,
        AllowedMethods: {
          Quantity: 2,
          Items: ['GET', 'HEAD'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD'],
          },
        },
      },
      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: 'S3-personal-portal',
            DomainName: `${this.bucketName}.s3.${this.region}.amazonaws.com`,
            S3OriginConfig: {
              OriginAccessIdentity: '',
            },
          },
        ],
      },
      Enabled: true,
      PriceClass: 'PriceClass_100',
      CustomErrorResponses: {
        Quantity: 1,
        Items: [
          {
            ErrorCode: 404,
            ResponsePagePath: '/index.html',
            ResponseCode: '200',
            ErrorCachingMinTTL: 300,
          },
        ],
      },
    };

    const configFile = '/tmp/cloudfront-config.json';
    writeFileSync(
      configFile,
      JSON.stringify({ DistributionConfig: distributionConfig }, null, 2)
    );

    try {
      const result = execSync(
        `aws cloudfront create-distribution --distribution-config file://${configFile}`,
        { encoding: 'utf8' }
      );

      const distribution = JSON.parse(result);
      const distributionId = distribution.Distribution.Id;
      const domainName = distribution.Distribution.DomainName;

      console.log('✅ CloudFront distribution created');
      console.log(`   Distribution ID: ${distributionId}`);
      console.log(`   Domain Name: ${domainName}`);

      // Save distribution info for later use
      const distributionInfo = {
        distributionId,
        domainName,
        createdAt: new Date().toISOString(),
      };

      writeFileSync(
        join(__dirname, '..', 'dist', 'cloudfront-info.json'),
        JSON.stringify(distributionInfo, null, 2)
      );
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ CloudFront distribution already exists');
      } else {
        throw new Error(
          `Failed to create CloudFront distribution: ${error.message}`
        );
      }
    }
  }

  printSetupSummary() {
    console.log('\n📋 Setup Summary:');
    console.log('================');
    console.log(`S3 Bucket: ${this.bucketName}`);
    console.log(`Region: ${this.region}`);
    console.log(
      `Website URL: http://${this.bucketName}.s3-website-${this.region}.amazonaws.com`
    );
    console.log('\n🔧 Next Steps:');
    console.log('1. Update your GitHub repository secrets with:');
    console.log(`   - S3_BUCKET_NAME: ${this.bucketName}`);
    console.log(
      '   - CLOUDFRONT_DISTRIBUTION_ID: (check cloudfront-info.json)'
    );
    console.log('2. Run deployment: npm run deploy:full');
    console.log(
      '3. Access your site via CloudFront URL (check cloudfront-info.json)'
    );
  }
}

// Run if called directly
if (require.main === module) {
  const setup = new AWSInfrastructureSetup();
  setup.setup().catch(error => {
    console.error('Setup failed:', error);
    process.exit(1);
  });
}

module.exports = { AWSInfrastructureSetup };
