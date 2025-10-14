#!/usr/bin/env node

/**
 * Performance Test Runner
 *
 * This script runs performance tests and generates a comprehensive report
 * including bundle size analysis and performance metrics validation.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// ANSI color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  log(`\n${'='.repeat(50)}`, 'cyan');
  log(`${title}`, 'bright');
  log(`${'='.repeat(50)}`, 'cyan');
}

function logSubsection(title) {
  log(`\n${'-'.repeat(30)}`, 'blue');
  log(`${title}`, 'blue');
  log(`${'-'.repeat(30)}`, 'blue');
}

async function runCommand(command, description) {
  try {
    log(`\n🔄 ${description}...`, 'yellow');
    const output = execSync(command, {
      cwd: rootDir,
      encoding: 'utf8',
      stdio: 'pipe',
    });
    log(`✅ ${description} completed`, 'green');
    return { success: true, output };
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    return { success: false, error: error.message, output: error.stdout };
  }
}

function checkBuildExists() {
  const distPath = join(rootDir, 'dist');
  return existsSync(distPath);
}

function generateReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      buildExists: checkBuildExists(),
    },
    performance: {
      bundleSize: results.bundleSize || {},
      loadSpeed: results.loadSpeed || {},
      monitoring: results.monitoring || {},
    },
    recommendations: [],
  };

  // Parse test results to extract metrics
  if (results.testOutput) {
    const testLines = results.testOutput.split('\n');
    testLines.forEach(line => {
      if (line.includes('✓') || line.includes('passed')) {
        report.summary.passedTests++;
      } else if (line.includes('✗') || line.includes('failed')) {
        report.summary.failedTests++;
      }
    });
    report.summary.totalTests =
      report.summary.passedTests + report.summary.failedTests;
  }

  // Add recommendations based on results
  if (!report.summary.buildExists) {
    report.recommendations.push({
      type: 'warning',
      message:
        'Build directory not found. Run "npm run build" to enable bundle size analysis.',
    });
  }

  if (report.summary.failedTests > 0) {
    report.recommendations.push({
      type: 'error',
      message: `${report.summary.failedTests} performance tests failed. Review the test output for details.`,
    });
  }

  if (
    report.summary.passedTests === report.summary.totalTests &&
    report.summary.totalTests > 0
  ) {
    report.recommendations.push({
      type: 'success',
      message:
        'All performance tests passed! Your application meets the performance criteria.',
    });
  }

  return report;
}

function saveReport(report) {
  const reportPath = join(rootDir, 'performance-test-report.json');
  writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`📊 Performance report saved to: ${reportPath}`, 'cyan');
}

function displaySummary(report) {
  logSection('PERFORMANCE TEST SUMMARY');

  log(`📅 Test Date: ${new Date(report.timestamp).toLocaleString()}`, 'blue');
  log(
    `🏗️  Build Status: ${report.summary.buildExists ? '✅ Available' : '❌ Not Found'}`,
    report.summary.buildExists ? 'green' : 'red'
  );
  log(`📊 Total Tests: ${report.summary.totalTests}`, 'blue');
  log(`✅ Passed: ${report.summary.passedTests}`, 'green');
  log(
    `❌ Failed: ${report.summary.failedTests}`,
    report.summary.failedTests > 0 ? 'red' : 'green'
  );

  if (report.recommendations.length > 0) {
    logSubsection('RECOMMENDATIONS');
    report.recommendations.forEach(rec => {
      const icon =
        rec.type === 'error' ? '❌' : rec.type === 'warning' ? '⚠️' : '✅';
      const color =
        rec.type === 'error'
          ? 'red'
          : rec.type === 'warning'
            ? 'yellow'
            : 'green';
      log(`${icon} ${rec.message}`, color);
    });
  }
}

async function main() {
  logSection('PERFORMANCE TEST RUNNER');

  const results = {};

  // Check if build exists
  const buildExists = checkBuildExists();
  if (!buildExists) {
    log('⚠️  Build directory not found. Some tests may be skipped.', 'yellow');
    log('💡 Run "npm run build" to enable full bundle size analysis.', 'blue');
  }

  // Run performance tests
  logSubsection('Running Performance Tests');

  const testCommands = [
    {
      command: 'npm run test -- src/test/performance.test.ts --run',
      description: 'Page Load Speed Tests',
      key: 'loadSpeed',
    },
    {
      command: 'npm run test -- src/test/bundleSize.test.ts --run',
      description: 'Bundle Size Tests',
      key: 'bundleSize',
    },
    {
      command: 'npm run test -- src/test/performanceMonitoring.test.ts --run',
      description: 'Performance Monitoring Tests',
      key: 'monitoring',
    },
  ];

  let allTestsOutput = '';

  for (const testCmd of testCommands) {
    const result = await runCommand(testCmd.command, testCmd.description);
    results[testCmd.key] = result;
    if (result.output) {
      allTestsOutput += result.output + '\n';
    }
  }

  results.testOutput = allTestsOutput;

  // Generate and save report
  logSubsection('Generating Report');
  const report = generateReport(results);
  saveReport(report);

  // Display summary
  displaySummary(report);

  // Additional build analysis if build exists
  if (buildExists) {
    logSubsection('Build Analysis');
    const buildAnalysis = await runCommand(
      'npm run build -- --mode=production',
      'Build Analysis'
    );
    if (buildAnalysis.success && buildAnalysis.output) {
      // Extract bundle information from build output
      const bundleLines = buildAnalysis.output
        .split('\n')
        .filter(
          line =>
            line.includes('dist/') &&
            (line.includes('.js') || line.includes('.css'))
        );

      if (bundleLines.length > 0) {
        log('\n📦 Bundle Information:', 'cyan');
        bundleLines.forEach(line => {
          log(`   ${line.trim()}`, 'blue');
        });
      }
    }
  }

  // Performance tips
  logSubsection('Performance Tips');
  log('💡 To improve performance:', 'blue');
  log('   • Enable gzip compression on your server', 'blue');
  log('   • Use a CDN for static assets', 'blue');
  log('   • Implement service worker for caching', 'blue');
  log('   • Optimize images (WebP format, proper sizing)', 'blue');
  log('   • Monitor Core Web Vitals in production', 'blue');

  // Exit with appropriate code
  const hasFailures = report.summary.failedTests > 0;
  if (hasFailures) {
    log(
      '\n❌ Some performance tests failed. Check the output above for details.',
      'red'
    );
    process.exit(1);
  } else {
    log('\n✅ All performance tests completed successfully!', 'green');
    process.exit(0);
  }
}

// Handle errors
process.on('uncaughtException', error => {
  log(`\n❌ Uncaught Exception: ${error.message}`, 'red');
  console.error(error.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  log(`\n❌ Unhandled Rejection at: ${promise}, reason: ${reason}`, 'red');
  process.exit(1);
});

// Run the main function
main().catch(error => {
  log(`\n❌ Error: ${error.message}`, 'red');
  console.error(error.stack);
  process.exit(1);
});
