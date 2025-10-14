#!/usr/bin/env node

/**
 * Full Deployment Script
 * Handles complete deployment process including build, upload, and verification
 */

const { execSync } = require('child_process');
const { existsSync, readFileSync } = require('fs');
const { join } = require('path');

class FullDeployment {
  constructor() {
    this.startTime = Date.now();
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    this.region = process.env.AWS_REGION || 'us-east-1';
    this.dryRun = process.argv.includes('--dry-run');
  }

  async deploy() {
    console.log('🚀 Starting full deployment process...');

    if (this.dryRun) {
      console.log('🔍 DRY RUN MODE - No actual deployment will occur');
    }

    try {
      this.validateConfiguration();
      this.runBuild();
      this.runVerification();

      if (!this.dryRun) {
        this.deployToS3();
        this.invalidateCloudFront();
        this.runPostDeploymentChecks();
      }

      this.printDeploymentSummary();

      const duration = ((Date.now() - this.startTime) / 1000).toFixed(2);
      console.log(`✅ Deployment completed successfully in ${duration}s`);
    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      process.exit(1);
    }
  }

  validateConfiguration() {
    console.log('🔍 Validating deployment configuration...');

    // Check required environment variables
    const requiredVars = ['S3_BUCKET_NAME', 'CLOUDFRONT_DISTRIBUTION_ID'];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(', ')}\n` +
          'Please set these in your environment or GitHub repository secrets.'
      );
    }

    // Validate AWS credentials
    try {
      execSync('aws sts get-caller-identity', { stdio: 'ignore' });
      console.log('✅ AWS credentials validated');
    } catch (error) {
      throw new Error(
        'AWS credentials not configured. Run "aws configure" first.'
      );
    }

    // Check if S3 bucket exists
    try {
      execSync(`aws s3api head-bucket --bucket ${this.bucketName}`, {
        stdio: 'ignore',
      });
      console.log(`✅ S3 bucket ${this.bucketName} exists`);
    } catch (error) {
      throw new Error(
        `S3 bucket ${this.bucketName} not found. Run "npm run aws:setup" first.`
      );
    }

    console.log('✅ Configuration validation passed');
  }

  runBuild() {
    console.log('🔨 Running production build...');

    try {
      execSync('npm run deploy:build', { stdio: 'inherit' });
      console.log('✅ Build completed successfully');
    } catch (error) {
      throw new Error('Build process failed');
    }
  }

  runVerification() {
    console.log('🔍 Running deployment verification...');

    try {
      execSync('npm run deploy:verify', { stdio: 'inherit' });
      console.log('✅ Verification completed successfully');
    } catch (error) {
      throw new Error('Verification failed');
    }
  }

  deployToS3() {
    console.log(`📤 Deploying to S3 bucket: ${this.bucketName}...`);

    try {
      // Upload HTML files with no-cache headers
      console.log('  📄 Uploading HTML files...');
      execSync(
        `aws s3 sync dist/ s3://${this.bucketName} ` +
          `--cache-control "no-cache" ` +
          `--include "*.html" ` +
          `--include "*.json" ` +
          `--exclude "*"`,
        { stdio: 'inherit' }
      );

      // Upload asset files with long-term caching
      console.log('  📦 Uploading asset files...');
      execSync(
        `aws s3 sync dist/ s3://${this.bucketName} ` +
          `--cache-control "public, max-age=31536000" ` +
          `--exclude "*.html" ` +
          `--exclude "*.json"`,
        { stdio: 'inherit' }
      );

      // Clean up old files
      console.log('  🧹 Cleaning up old files...');
      execSync(`aws s3 sync dist/ s3://${this.bucketName} --delete`, {
        stdio: 'inherit',
      });

      console.log('✅ S3 deployment completed');
    } catch (error) {
      throw new Error(`S3 deployment failed: ${error.message}`);
    }
  }

  invalidateCloudFront() {
    console.log(`☁️  Invalidating CloudFront cache: ${this.distributionId}...`);

    try {
      const result = execSync(
        `aws cloudfront create-invalidation ` +
          `--distribution-id ${this.distributionId} ` +
          `--paths "/*"`,
        { encoding: 'utf8' }
      );

      const invalidation = JSON.parse(result);
      const invalidationId = invalidation.Invalidation.Id;

      console.log(`✅ CloudFront invalidation created: ${invalidationId}`);
      console.log('   Note: Invalidation may take 5-15 minutes to complete');
    } catch (error) {
      throw new Error(`CloudFront invalidation failed: ${error.message}`);
    }
  }

  runPostDeploymentChecks() {
    console.log('🔍 Running post-deployment checks...');

    try {
      // Check if website is accessible
      const websiteUrl = `http://${this.bucketName}.s3-website-${this.region}.amazonaws.com`;
      console.log(`  🌐 Website URL: ${websiteUrl}`);

      // Get CloudFront distribution info
      try {
        const result = execSync(
          `aws cloudfront get-distribution --id ${this.distributionId}`,
          { encoding: 'utf8' }
        );
        const distribution = JSON.parse(result);
        const domainName = distribution.Distribution.DomainName;
        const status = distribution.Distribution.Status;

        console.log(`  ☁️  CloudFront URL: https://${domainName}`);
        console.log(`  📊 Distribution Status: ${status}`);
      } catch (error) {
        console.log('  ⚠️  Could not retrieve CloudFront info');
      }

      console.log('✅ Post-deployment checks completed');
    } catch (error) {
      console.log('⚠️  Post-deployment checks failed:', error.message);
    }
  }

  printDeploymentSummary() {
    console.log('\n📋 Deployment Summary:');
    console.log('======================');

    // Read build info if available
    const buildInfoPath = join('dist', 'build-info.json');
    if (existsSync(buildInfoPath)) {
      try {
        const buildInfo = JSON.parse(readFileSync(buildInfoPath, 'utf8'));
        console.log(`Build Version: ${buildInfo.version}`);
        console.log(`Build Time: ${buildInfo.timestamp}`);
        console.log(`Total Size: ${buildInfo.totalSizeFormatted || 'Unknown'}`);
      } catch (error) {
        console.log('Build info not available');
      }
    }

    console.log(`S3 Bucket: ${this.bucketName}`);
    console.log(`CloudFront Distribution: ${this.distributionId}`);
    console.log(`Region: ${this.region}`);

    if (this.dryRun) {
      console.log('\n🔍 This was a DRY RUN - no actual deployment occurred');
    } else {
      console.log('\n🎉 Deployment completed successfully!');
      console.log(
        'Your site should be available at the CloudFront URL within 5-15 minutes.'
      );
    }
  }
}

// Run if called directly
if (require.main === module) {
  const deployment = new FullDeployment();
  deployment.deploy().catch(error => {
    console.error('Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = { FullDeployment };
