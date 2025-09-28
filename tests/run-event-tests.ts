#!/usr/bin/env node

/**
 * PMI Lakeshore Event Testing Runner
 * This script runs the event navigation tests with enhanced logging and reporting
 */

import { spawn } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Ensure test-results directory exists
const testResultsDir = 'test-results';
if (!existsSync(testResultsDir)) {
  mkdirSync(testResultsDir, { recursive: true });
}

// Configuration
const tests = [
  {
    name: 'Event Navigation Test',
    file: 'tests/pmiloc-event-navigation.spec.ts',
    description: 'Tests navigation to events, clicking details, and guest registration'
  },
  {
    name: 'Banner Navigation Test',
    file: 'tests/pmiloc-banner-navigation.spec.ts',
    description: 'Tests navigation via banner image clicks to events'
  }
];

console.log('🎭 PMI Lakeshore Event Testing Suite');
console.log('=' .repeat(60));
console.log(`📅 Start Time: ${new Date().toLocaleString()}`);
console.log(`🎯 Tests to Run: ${tests.length}`);
console.log('=' .repeat(60));

async function runTest(test: any): Promise<boolean> {
  return new Promise((resolve) => {
    console.log(`\n🚀 Starting: ${test.name}`);
    console.log(`📄 Description: ${test.description}`);
    console.log(`📁 File: ${test.file}`);
    console.log('-' .repeat(40));

    const playwright = spawn('npx', [
      'playwright',
      'test',
      test.file,
      '--headed',
      '--project=pmiloc-chromium',
      '--reporter=list'
    ], {
      stdio: 'inherit',
      shell: true
    });

    playwright.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${test.name} completed successfully`);
        resolve(true);
      } else {
        console.log(`❌ ${test.name} failed with exit code ${code}`);
        resolve(false);
      }
    });

    playwright.on('error', (error) => {
      console.error(`❌ Error running ${test.name}:`, error);
      resolve(false);
    });
  });
}

async function runAllTests() {
  const startTime = Date.now();
  const results = [];

  for (const test of tests) {
    const success = await runTest(test);
    results.push({ test: test.name, success });

    // Wait between tests
    if (tests.indexOf(test) < tests.length - 1) {
      console.log('\n⏳ Waiting 3 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
  }

  const endTime = Date.now();
  const duration = endTime - startTime;

  // Print summary
  console.log('\n' + '=' .repeat(60));
  console.log('📊 PMI LAKESHORE EVENT TESTING SUMMARY');
  console.log('=' .repeat(60));
  console.log(`⏱️  Total Duration: ${Math.round(duration / 1000)}s`);
  console.log(`🎯 Total Tests: ${results.length}`);

  const passed = results.filter(r => r.success).length;
  const failed = results.length - passed;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / results.length) * 100)}%`);

  console.log('\n📋 Individual Results:');
  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`  ${icon} ${result.test}`);
  });

  if (failed > 0) {
    console.log('\n⚠️  Some tests failed. Check the detailed reports:');
    console.log('   • test-results/pmiloc-test-report.html');
    console.log('   • test-results/event-navigation-report.html');
    console.log('   • test-results/banner-navigation-report.html');
  } else {
    console.log('\n🎉 All tests passed! Great job!');
    console.log('📄 View detailed reports:');
    console.log('   • test-results/pmiloc-test-report.html');
  }

  console.log('\n💡 To view reports, run: npm run report:custom');
  console.log('=' .repeat(60));

  process.exit(failed > 0 ? 1 : 0);
}

// Handle script termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Test execution interrupted by user');
  process.exit(1);
});

// Run all tests
runAllTests().catch(error => {
  console.error('❌ Fatal error running tests:', error);
  process.exit(1);
});