#!/usr/bin/env node

/**
 * Deployment Status Monitoring Script
 * Monitors deployment status and provides health checks
 */

const { execSync } = require('child_process');
const https = require('https');
const http = require('http');

class DeploymentStatusMonitor {
  constructor() {
    this.bucketName = process.env.S3_BUCKET_NAME;
    this.distributionId = process.env.CLOUDFRONT_DISTRIBUTION_ID;
    this.region = process.env.AWS_REGION || 'us-east-1';
  }

  async checkStatus() {
    console.log('🔍 Checking deployment status...');

    try {
      this.validateConfiguration();
      await this.checkS3Status();
      await this.checkCloudFrontStatus();
      await this.checkWebsiteHealth();

      console.log('✅ All deployment checks passed!');
    } catch (error) {
      console.error('❌ Status check failed:', error.message);
      process.exit(1);
    }
  }

  validateConfiguration() {
    if (!this.bucketName || !this.distributionId) {
      throw new Error(
        'Missing S3_BUCKET_NAME or CLOUDFRONT_DISTRIBUTION_ID environment variables'
      );
    }
  }

  async checkS3Status() {
    console.log('🪣 Checking S3 bucket status...');

    try {
      // Check bucket exists and is accessible
      execSync(`aws s3api head-bucket --bucket ${this.bucketName}`, {
        stdio: 'ignore',
      });
      console.log('✅ S3 bucket is accessible');

      // Check website configuration
      const websiteConfig = execSync(
        `aws s3api get-bucket-website --bucket ${this.bucketName}`,
        { encoding: 'utf8' }
      );
      const config = JSON.parse(websiteConfig);

      if (
        config.IndexDocument &&
        config.IndexDocument.Suffix === 'index.html'
      ) {
        console.log('✅ S3 website hosting is configured correctly');
      } else {
        console.log('⚠️  S3 website hosting configuration may be incorrect');
      }

      // Check if index.html exists
      try {
        execSync(
          `aws s3api head-object --bucket ${this.bucketName} --key index.html`,
          { stdio: 'ignore' }
        );
        console.log('✅ index.html found in S3 bucket');
      } catch (error) {
        console.log('❌ index.html not found in S3 bucket');
      }
    } catch (error) {
      throw new Error(`S3 status check failed: ${error.message}`);
    }
  }

  async checkCloudFrontStatus() {
    console.log('☁️  Checking CloudFront distribution status...');

    try {
      const result = execSync(
        `aws cloudfront get-distribution --id ${this.distributionId}`,
        { encoding: 'utf8' }
      );

      const distribution = JSON.parse(result);
      const status = distribution.Distribution.Status;
      const domainName = distribution.Distribution.DomainName;
      const enabled = distribution.Distribution.DistributionConfig.Enabled;

      console.log(`   Distribution ID: ${this.distributionId}`);
      console.log(`   Domain Name: ${domainName}`);
      console.log(`   Status: ${status}`);
      console.log(`   Enabled: ${enabled}`);

      if (status === 'Deployed' && enabled) {
        console.log('✅ CloudFront distribution is active and deployed');
      } else if (status === 'InProgress') {
        console.log('⏳ CloudFront distribution deployment is in progress');
      } else {
        console.log('⚠️  CloudFront distribution may have issues');
      }

      // Check for recent invalidations
      try {
        const invalidations = execSync(
          `aws cloudfront list-invalidations --distribution-id ${this.distributionId} --max-items 5`,
          { encoding: 'utf8' }
        );

        const invalidationData = JSON.parse(invalidations);
        if (invalidationData.InvalidationList.Items.length > 0) {
          const latest = invalidationData.InvalidationList.Items[0];
          console.log(
            `   Latest Invalidation: ${latest.Id} (${latest.Status})`
          );
        }
      } catch (error) {
        console.log('   Could not retrieve invalidation status');
      }
    } catch (error) {
      throw new Error(`CloudFront status check failed: ${error.message}`);
    }
  }

  async checkWebsiteHealth() {
    console.log('🌐 Checking website health...');

    const s3WebsiteUrl = `http://${this.bucketName}.s3-website-${this.region}.amazonaws.com`;

    // Get CloudFront domain
    let cloudFrontUrl;
    try {
      const result = execSync(
        `aws cloudfront get-distribution --id ${this.distributionId}`,
        { encoding: 'utf8' }
      );
      const distribution = JSON.parse(result);
      cloudFrontUrl = `https://${distribution.Distribution.DomainName}`;
    } catch (error) {
      console.log('⚠️  Could not retrieve CloudFront URL');
    }

    // Check S3 website endpoint
    try {
      await this.checkUrl(s3WebsiteUrl);
      console.log('✅ S3 website endpoint is accessible');
    } catch (error) {
      console.log(`❌ S3 website endpoint check failed: ${error.message}`);
    }

    // Check CloudFront endpoint
    if (cloudFrontUrl) {
      try {
        await this.checkUrl(cloudFrontUrl);
        console.log('✅ CloudFront endpoint is accessible');
      } catch (error) {
        console.log(`❌ CloudFront endpoint check failed: ${error.message}`);
      }
    }
  }

  checkUrl(url) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https:') ? https : http;
      const timeout = 10000; // 10 seconds

      const req = client.get(url, { timeout }, res => {
        if (res.statusCode >= 200 && res.statusCode < 400) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
          });
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.on('error', error => {
        reject(error);
      });
    });
  }

  async monitorInvalidation(invalidationId) {
    console.log(`⏳ Monitoring invalidation: ${invalidationId}...`);

    const maxAttempts = 30; // 15 minutes max
    const interval = 30000; // 30 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = execSync(
          `aws cloudfront get-invalidation --distribution-id ${this.distributionId} --id ${invalidationId}`,
          { encoding: 'utf8' }
        );

        const invalidation = JSON.parse(result);
        const status = invalidation.Invalidation.Status;

        console.log(`   Attempt ${attempt}/${maxAttempts}: Status = ${status}`);

        if (status === 'Completed') {
          console.log('✅ Invalidation completed successfully');
          return;
        }

        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }
      } catch (error) {
        console.log(`   Error checking invalidation: ${error.message}`);
      }
    }

    console.log('⚠️  Invalidation monitoring timed out');
  }
}

// Command line interface
if (require.main === module) {
  const monitor = new DeploymentStatusMonitor();

  const command = process.argv[2];

  if (command === 'monitor-invalidation') {
    const invalidationId = process.argv[3];
    if (!invalidationId) {
      console.error(
        'Usage: node deploy-status.cjs monitor-invalidation <invalidation-id>'
      );
      process.exit(1);
    }
    monitor.monitorInvalidation(invalidationId).catch(error => {
      console.error('Monitoring failed:', error);
      process.exit(1);
    });
  } else {
    monitor.checkStatus().catch(error => {
      console.error('Status check failed:', error);
      process.exit(1);
    });
  }
}

module.exports = { DeploymentStatusMonitor };
