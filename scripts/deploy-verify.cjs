#!/usr/bin/env node

/**
 * Deployment Verification Script
 * Validates deployment readiness and performs post-deployment checks
 */

const { existsSync, readFileSync, statSync, writeFileSync } = require('fs');
const { join } = require('path');
const { glob } = require('glob');

const VERIFICATION_CONFIG = {
  distDir: 'dist',
  maxLoadTime: 3000, // 3 seconds
  requiredFiles: ['index.html', 'assets', 'build-info.json'],
  requiredAssets: ['*.js', '*.css'],
  securityHeaders: [
    'Content-Security-Policy',
    'X-Frame-Options',
    'X-Content-Type-Options',
  ],
};

class DeploymentVerifier {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      checks: [],
      passed: 0,
      failed: 0,
      warnings: 0,
    };
  }

  async verify() {
    console.log('🔍 Starting deployment verification...');

    try {
      this.checkBuildOutput();
      this.checkFileIntegrity();
      this.checkAssetOptimization();
      this.checkConfiguration();
      this.checkSecurity();
      this.generateReport();

      const success = this.results.failed === 0;

      if (success) {
        console.log(
          `✅ Verification completed: ${this.results.passed} checks passed`
        );
        if (this.results.warnings > 0) {
          console.log(`⚠️  ${this.results.warnings} warnings found`);
        }
      } else {
        console.log(
          `❌ Verification failed: ${this.results.failed} checks failed`
        );
        process.exit(1);
      }

      return { success, results: this.results };
    } catch (error) {
      console.error('❌ Verification error:', error.message);
      process.exit(1);
    }
  }

  checkBuildOutput() {
    console.log('📁 Checking build output...');

    // Check if dist directory exists
    this.addCheck(
      'Build Directory',
      existsSync(VERIFICATION_CONFIG.distDir),
      'Build directory exists',
      'Build directory not found'
    );

    // Check required files
    for (const file of VERIFICATION_CONFIG.requiredFiles) {
      const filePath = join(VERIFICATION_CONFIG.distDir, file);
      this.addCheck(
        `Required File: ${file}`,
        existsSync(filePath),
        `${file} exists`,
        `${file} not found`
      );
    }

    // Check for required assets
    for (const pattern of VERIFICATION_CONFIG.requiredAssets) {
      const files = glob.sync(
        join(VERIFICATION_CONFIG.distDir, 'assets', pattern)
      );
      this.addCheck(
        `Asset Pattern: ${pattern}`,
        files.length > 0,
        `Found ${files.length} files matching ${pattern}`,
        `No files found matching ${pattern}`
      );
    }
  }

  checkFileIntegrity() {
    console.log('🔍 Checking file integrity...');

    // Check index.html
    const indexPath = join(VERIFICATION_CONFIG.distDir, 'index.html');
    if (existsSync(indexPath)) {
      const content = readFileSync(indexPath, 'utf8');

      // Check for essential HTML structure
      this.addCheck(
        'HTML Structure',
        content.includes('<html') && content.includes('</html>'),
        'Valid HTML structure found',
        'Invalid HTML structure'
      );

      // Check for asset references
      this.addCheck(
        'Asset References',
        content.includes('/assets/') || content.includes('./assets/'),
        'Asset references found in HTML',
        'No asset references found in HTML'
      );

      // Check for meta tags
      this.addCheck(
        'Meta Tags',
        content.includes('<meta') && content.includes('viewport'),
        'Essential meta tags found',
        'Missing essential meta tags'
      );
    }

    // Check build info
    const buildInfoPath = join(VERIFICATION_CONFIG.distDir, 'build-info.json');
    if (existsSync(buildInfoPath)) {
      try {
        const buildInfo = JSON.parse(readFileSync(buildInfoPath, 'utf8'));
        this.addCheck(
          'Build Info',
          buildInfo.timestamp && buildInfo.version,
          'Valid build information',
          'Invalid build information'
        );
      } catch (error) {
        this.addCheck(
          'Build Info',
          false,
          'Valid build information',
          'Invalid JSON in build-info.json'
        );
      }
    }
  }

  checkAssetOptimization() {
    console.log('⚡ Checking asset optimization...');

    const jsFiles = glob.sync(
      join(VERIFICATION_CONFIG.distDir, 'assets', '*.js')
    );
    const cssFiles = glob.sync(
      join(VERIFICATION_CONFIG.distDir, 'assets', '*.css')
    );

    // Check JavaScript files
    for (const file of jsFiles) {
      const stats = statSync(file);
      const sizeKB = stats.size / 1024;

      this.addCheck(
        `JS Bundle Size: ${file.split('/').pop()}`,
        sizeKB < 1024, // Less than 1MB
        `Bundle size: ${sizeKB.toFixed(2)}KB`,
        `Large bundle: ${sizeKB.toFixed(2)}KB`,
        sizeKB > 512 ? 'warning' : 'pass' // Warning if > 512KB
      );
    }

    // Check CSS files
    for (const file of cssFiles) {
      const stats = statSync(file);
      const sizeKB = stats.size / 1024;

      this.addCheck(
        `CSS Bundle Size: ${file.split('/').pop()}`,
        sizeKB < 100, // Less than 100KB
        `CSS size: ${sizeKB.toFixed(2)}KB`,
        `Large CSS: ${sizeKB.toFixed(2)}KB`,
        sizeKB > 50 ? 'warning' : 'pass' // Warning if > 50KB
      );
    }

    // Check for source maps in production
    const sourceMaps = glob.sync(
      join(VERIFICATION_CONFIG.distDir, 'assets', '*.map')
    );
    this.addCheck(
      'Source Maps',
      sourceMaps.length === 0,
      'No source maps in production build',
      'Source maps found in production build',
      sourceMaps.length > 0 ? 'warning' : 'pass'
    );
  }

  checkConfiguration() {
    console.log('⚙️  Checking configuration...');

    // Check environment variables
    const requiredEnvVars = ['VITE_YOUTUBE_API_KEY'];
    for (const envVar of requiredEnvVars) {
      this.addCheck(
        `Environment Variable: ${envVar}`,
        !!process.env[envVar],
        `${envVar} is configured`,
        `${envVar} is missing`
      );
    }

    // Check production environment
    this.addCheck(
      'Production Environment',
      process.env.NODE_ENV === 'production',
      'Production environment detected',
      'Not in production environment',
      'warning'
    );
  }

  checkSecurity() {
    console.log('🔒 Checking security considerations...');

    // Check for sensitive files
    const sensitiveFiles = ['.env', '.env.local', '.env.production'];
    for (const file of sensitiveFiles) {
      const filePath = join(VERIFICATION_CONFIG.distDir, file);
      this.addCheck(
        `Sensitive File: ${file}`,
        !existsSync(filePath),
        `${file} not in build output`,
        `${file} found in build output - security risk!`
      );
    }

    // Check index.html for security headers hints
    const indexPath = join(VERIFICATION_CONFIG.distDir, 'index.html');
    if (existsSync(indexPath)) {
      const content = readFileSync(indexPath, 'utf8');

      // Check for CSP meta tag
      this.addCheck(
        'Content Security Policy',
        content.includes('Content-Security-Policy') || content.includes('csp'),
        'CSP configuration found',
        'No CSP configuration detected',
        'warning'
      );
    }
  }

  generateReport() {
    console.log('📊 Generating verification report...');

    const reportPath = join(
      VERIFICATION_CONFIG.distDir,
      'verification-report.json'
    );
    const report = {
      ...this.results,
      summary: {
        total: this.results.checks.length,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        successRate:
          ((this.results.passed / this.results.checks.length) * 100).toFixed(
            2
          ) + '%',
      },
    };

    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📋 Verification report saved to ${reportPath}`);
  }

  addCheck(name, passed, successMessage, failureMessage, type = null) {
    const checkType = type || (passed ? 'pass' : 'fail');

    const check = {
      name,
      passed: checkType !== 'fail',
      type: checkType,
      message: passed ? successMessage : failureMessage,
      timestamp: new Date().toISOString(),
    };

    this.results.checks.push(check);

    switch (checkType) {
      case 'pass':
        this.results.passed++;
        console.log(`  ✅ ${name}: ${successMessage}`);
        break;
      case 'fail':
        this.results.failed++;
        console.log(`  ❌ ${name}: ${failureMessage}`);
        break;
      case 'warning':
        this.results.warnings++;
        console.log(`  ⚠️  ${name}: ${failureMessage}`);
        break;
    }
  }
}

// Run if called directly
if (require.main === module) {
  const verifier = new DeploymentVerifier();
  verifier.verify().catch(error => {
    console.error('Verification failed:', error);
    process.exit(1);
  });
}

module.exports = { DeploymentVerifier };
