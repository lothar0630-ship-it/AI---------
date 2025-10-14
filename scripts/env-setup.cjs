#!/usr/bin/env node

/**
 * Environment Setup Script
 * Helps configure environment variables for different deployment environments
 */

const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

class EnvironmentSetup {
  constructor() {
    this.environments = ['development', 'production', 'staging'];
  }

  setup() {
    console.log('🔧 Environment Setup Wizard');
    console.log('============================\n');

    const environment = this.getEnvironment();

    switch (environment) {
      case 'development':
        this.setupDevelopment();
        break;
      case 'production':
        this.setupProduction();
        break;
      case 'staging':
        this.setupStaging();
        break;
      default:
        console.log('❌ Invalid environment selected');
        process.exit(1);
    }
  }

  getEnvironment() {
    const env = process.argv[2];
    if (env && this.environments.includes(env)) {
      return env;
    }

    console.log('Usage: node env-setup.cjs <environment>');
    console.log('Available environments:');
    this.environments.forEach(env => console.log(`  - ${env}`));
    process.exit(1);
  }

  setupDevelopment() {
    console.log('🛠️  Setting up development environment...');

    const devConfig = {
      VITE_YOUTUBE_API_KEY: 'your_youtube_api_key_here',
      VITE_APP_TITLE: 'Personal Portal Site (Dev)',
      VITE_APP_DESCRIPTION: 'Development version of personal portfolio',
      VITE_DEV_MODE: 'true',
      VITE_NODE_ENV: 'development',
      VITE_ENABLE_ANALYTICS: 'false',
      VITE_ENABLE_ERROR_REPORTING: 'false',
      VITE_API_TIMEOUT: '5000',
      VITE_API_RETRY_COUNT: '2',
    };

    this.writeEnvFile('.env.local', devConfig);
    console.log('✅ Development environment configured');
    console.log('📝 Please update .env.local with your actual API keys');
  }

  setupProduction() {
    console.log('🚀 Setting up production environment...');

    const prodConfig = {
      VITE_YOUTUBE_API_KEY: '',
      VITE_APP_TITLE: 'Personal Portal Site',
      VITE_APP_DESCRIPTION: 'Modern personal portfolio and social media hub',
      VITE_DEV_MODE: 'false',
      VITE_NODE_ENV: 'production',
      VITE_ENABLE_ANALYTICS: 'true',
      VITE_ENABLE_ERROR_REPORTING: 'true',
      VITE_CDN_URL: '',
      VITE_API_TIMEOUT: '10000',
      VITE_API_RETRY_COUNT: '3',
    };

    this.writeEnvFile('.env.production', prodConfig);

    // Create GitHub Actions environment template
    this.createGitHubSecretsTemplate();

    console.log('✅ Production environment configured');
    console.log('📝 Please update .env.production with your actual values');
    console.log('📝 Check github-secrets-template.md for GitHub Actions setup');
  }

  setupStaging() {
    console.log('🧪 Setting up staging environment...');

    const stagingConfig = {
      VITE_YOUTUBE_API_KEY: '',
      VITE_APP_TITLE: 'Personal Portal Site (Staging)',
      VITE_APP_DESCRIPTION: 'Staging version of personal portfolio',
      VITE_DEV_MODE: 'false',
      VITE_NODE_ENV: 'staging',
      VITE_ENABLE_ANALYTICS: 'false',
      VITE_ENABLE_ERROR_REPORTING: 'true',
      VITE_CDN_URL: '',
      VITE_API_TIMEOUT: '8000',
      VITE_API_RETRY_COUNT: '2',
    };

    this.writeEnvFile('.env.staging', stagingConfig);
    console.log('✅ Staging environment configured');
    console.log('📝 Please update .env.staging with your actual values');
  }

  writeEnvFile(filename, config) {
    const content = Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const header = `# ${filename.toUpperCase()} Environment Configuration
# Generated on ${new Date().toISOString()}
# 
# IMPORTANT: Do not commit this file with real API keys!
# Add ${filename} to .gitignore if it contains sensitive data
#

`;

    writeFileSync(filename, header + content + '\n');
    console.log(`📄 Created ${filename}`);
  }

  createGitHubSecretsTemplate() {
    const template = `# GitHub Repository Secrets Setup

## Required Secrets

Add these secrets in your GitHub repository:
Settings > Secrets and variables > Actions > New repository secret

### AWS Configuration
- \`AWS_ACCESS_KEY_ID\`: Your AWS access key ID
- \`AWS_SECRET_ACCESS_KEY\`: Your AWS secret access key
- \`S3_BUCKET_NAME\`: Your S3 bucket name (e.g., my-personal-portal-bucket)
- \`CLOUDFRONT_DISTRIBUTION_ID\`: Your CloudFront distribution ID

### Application Configuration
- \`VITE_YOUTUBE_API_KEY\`: Your YouTube Data API v3 key

## Required Variables

Add these variables in your GitHub repository:
Settings > Secrets and variables > Actions > Variables tab

### Application Variables
- \`VITE_APP_TITLE\`: Personal Portal Site
- \`VITE_APP_DESCRIPTION\`: Modern personal portfolio and social media hub

## Setup Instructions

1. **AWS Setup**:
   \`\`\`bash
   # Run AWS infrastructure setup
   npm run aws:setup
   \`\`\`

2. **Get YouTube API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable YouTube Data API v3
   - Create credentials (API Key)
   - Restrict the key to YouTube Data API v3

3. **Test Deployment**:
   \`\`\`bash
   # Test deployment without actually deploying
   npm run deploy:dry-run
   \`\`\`

4. **Deploy**:
   \`\`\`bash
   # Full deployment
   npm run deploy:full
   \`\`\`

## Security Notes

- Never commit real API keys to version control
- Use environment-specific configurations
- Regularly rotate API keys
- Monitor AWS costs and usage
- Enable CloudTrail for audit logging

## Troubleshooting

### Common Issues

1. **AWS Credentials Error**:
   \`\`\`bash
   aws configure
   # or set environment variables
   export AWS_ACCESS_KEY_ID=your_key
   export AWS_SECRET_ACCESS_KEY=your_secret
   \`\`\`

2. **S3 Bucket Already Exists**:
   - Choose a globally unique bucket name
   - Update S3_BUCKET_NAME secret

3. **YouTube API Quota Exceeded**:
   - Check API usage in Google Cloud Console
   - Request quota increase if needed

4. **CloudFront Deployment Slow**:
   - CloudFront deployments can take 5-15 minutes
   - Use \`npm run deploy:status\` to monitor

## Monitoring

\`\`\`bash
# Check deployment status
npm run deploy:status

# Monitor specific invalidation
node scripts/deploy-status.cjs monitor-invalidation <invalidation-id>
\`\`\`
`;

    writeFileSync('github-secrets-template.md', template);
    console.log('📄 Created github-secrets-template.md');
  }

  validateEnvironment() {
    console.log('🔍 Validating current environment...');

    const requiredVars = [
      'VITE_YOUTUBE_API_KEY',
      'VITE_APP_TITLE',
      'VITE_APP_DESCRIPTION',
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);

    if (missingVars.length > 0) {
      console.log('❌ Missing environment variables:');
      missingVars.forEach(varName => console.log(`   - ${varName}`));
      return false;
    }

    console.log('✅ All required environment variables are set');
    return true;
  }

  listEnvironmentFiles() {
    console.log('📄 Environment files in project:');

    const envFiles = [
      '.env',
      '.env.local',
      '.env.development',
      '.env.production',
      '.env.staging',
      '.env.example',
    ];

    envFiles.forEach(file => {
      if (existsSync(file)) {
        console.log(`   ✅ ${file}`);
      } else {
        console.log(`   ❌ ${file} (not found)`);
      }
    });
  }
}

// Command line interface
if (require.main === module) {
  const setup = new EnvironmentSetup();

  const command = process.argv[2];

  if (command === 'validate') {
    setup.validateEnvironment();
  } else if (command === 'list') {
    setup.listEnvironmentFiles();
  } else {
    setup.setup();
  }
}

module.exports = { EnvironmentSetup };
