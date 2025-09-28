import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

class CustomPMIReporter implements Reporter {
  private testResults: Array<{
    test: TestCase;
    result: TestResult;
    duration: number;
    status: string;
    errors: string[];
    screenshots: string[];
    logs: string[];
  }> = [];

  private startTime: Date = new Date();
  private reportDir: string = 'test-results';

  onBegin(config: any, suite: any) {
    console.log('\n🎭 PMI Lakeshore Test Execution Started');
    console.log('='.repeat(60));
    console.log(`📅 Start Time: ${this.startTime.toLocaleString()}`);
    console.log(`🌐 Base URL: ${config.projects[0]?.use?.baseURL || 'Not specified'}`);
    console.log(`🎯 Total Tests: ${suite.allTests().length}`);
    console.log('='.repeat(60));

    // Ensure report directory exists
    if (!existsSync(this.reportDir)) {
      mkdirSync(this.reportDir, { recursive: true });
    }
  }

  onTestBegin(test: TestCase) {
    console.log(`\n🚀 Starting: ${test.title}`);
    console.log(`📁 File: ${test.location.file.split('/').pop()}`);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const duration = result.duration;
    const status = result.status;
    const errors = result.errors.map(error => error.message || error.value || 'Unknown error');

    // Extract screenshots from attachments
    const screenshots = result.attachments
      .filter(attachment => attachment.name.includes('screenshot') || attachment.contentType?.includes('image'))
      .map(attachment => attachment.path || attachment.name);

    // Extract logs (simplified)
    const logs = result.stdout.map(stdout => stdout.toString()).concat(
      result.stderr.map(stderr => stderr.toString())
    );

    this.testResults.push({
      test,
      result,
      duration,
      status,
      errors,
      screenshots,
      logs
    });

    // Print immediate result
    const statusIcon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⚠️';
    console.log(`${statusIcon} ${status.toUpperCase()}: ${test.title} (${duration}ms)`);

    if (errors.length > 0) {
      console.log('   🚨 Errors:');
      errors.forEach(error => console.log(`      ${error.substring(0, 100)}...`));
    }

    if (screenshots.length > 0) {
      console.log(`   📸 Screenshots: ${screenshots.length}`);
    }
  }

  onEnd(result: FullResult) {
    const endTime = new Date();
    const totalDuration = endTime.getTime() - this.startTime.getTime();

    const summary = this.generateSummary(totalDuration);
    this.printSummary(summary);
    this.generateHtmlReport(summary);
    this.generateJsonReport(summary);
  }

  private generateSummary(totalDuration: number) {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.status === 'passed').length;
    const failedTests = this.testResults.filter(r => r.status === 'failed').length;
    const skippedTests = this.testResults.filter(r => r.status === 'skipped').length;
    const flakyTests = this.testResults.filter(r => r.status === 'flaky').length;

    return {
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      flakyTests,
      successRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0',
      totalDuration: `${totalDuration}ms`,
      startTime: this.startTime,
      endTime: new Date(),
      testResults: this.testResults
    };
  }

  private printSummary(summary: any) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PMI LAKESHORE TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`📅 Execution Time: ${summary.startTime.toLocaleString()} - ${summary.endTime.toLocaleString()}`);
    console.log(`⏱️  Total Duration: ${summary.totalDuration}`);
    console.log(`🎯 Total Tests: ${summary.totalTests}`);
    console.log(`✅ Passed: ${summary.passedTests} (${summary.successRate}%)`);
    console.log(`❌ Failed: ${summary.failedTests}`);
    console.log(`⚠️  Skipped: ${summary.skippedTests}`);
    console.log(`🔄 Flaky: ${summary.flakyTests}`);
    console.log('='.repeat(60));

    if (summary.failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      summary.testResults
        .filter((r: any) => r.status === 'failed')
        .forEach((r: any) => {
          console.log(`  • ${r.test.title}`);
          console.log(`    File: ${r.test.location.file.split('/').pop()}`);
          console.log(`    Duration: ${r.duration}ms`);
          if (r.errors.length > 0) {
            console.log(`    Error: ${r.errors[0].substring(0, 150)}...`);
          }
        });
    }

    console.log(`\n📄 Reports generated in: ${this.reportDir}/`);
    console.log('   • pmiloc-test-report.html (Interactive HTML Report)');
    console.log('   • pmiloc-test-results.json (Raw JSON Data)');
  }

  private generateHtmlReport(summary: any) {
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PMI Lakeshore Test Report</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: 300;
        }
        .header p {
            margin: 10px 0 0;
            font-size: 1.1em;
            opacity: 0.9;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 0;
            background: #f8f9fa;
        }
        .stat-card {
            padding: 30px;
            text-align: center;
            border-right: 1px solid #dee2e6;
            position: relative;
        }
        .stat-card:last-child { border-right: none; }
        .stat-number {
            font-size: 3em;
            font-weight: bold;
            margin-bottom: 10px;
            display: block;
        }
        .stat-label {
            font-size: 1.1em;
            color: #6c757d;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .stat-passed .stat-number { color: #28a745; }
        .stat-failed .stat-number { color: #dc3545; }
        .stat-total .stat-number { color: #007bff; }
        .stat-rate .stat-number { color: #17a2b8; }
        .content {
            padding: 30px;
        }
        .test-list {
            margin-top: 30px;
        }
        .test-item {
            background: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 5px solid #dee2e6;
            transition: all 0.3s ease;
        }
        .test-item:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            transform: translateY(-2px);
        }
        .test-item.passed { border-left-color: #28a745; }
        .test-item.failed { border-left-color: #dc3545; }
        .test-item.skipped { border-left-color: #ffc107; }
        .test-header {
            padding: 20px;
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-title {
            font-weight: 600;
            font-size: 1.1em;
        }
        .test-status {
            padding: 5px 15px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
            text-transform: uppercase;
        }
        .status-passed {
            background: #d4edda;
            color: #155724;
        }
        .status-failed {
            background: #f8d7da;
            color: #721c24;
        }
        .status-skipped {
            background: #fff3cd;
            color: #856404;
        }
        .test-details {
            padding: 0 20px 20px;
            border-top: 1px solid #dee2e6;
            background: white;
            display: none;
        }
        .test-details.show {
            display: block;
        }
        .detail-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin: 20px 0;
        }
        .detail-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
        }
        .detail-label {
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
        }
        .detail-value {
            color: #6c757d;
        }
        .error-box {
            background: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 15px 0;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.9em;
            white-space: pre-wrap;
        }
        .screenshot-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }
        .screenshot-item {
            text-align: center;
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
        }
        .footer {
            background: #343a40;
            color: white;
            text-align: center;
            padding: 20px;
            font-size: 0.9em;
        }
        .progress-bar {
            width: 100%;
            height: 6px;
            background: #e9ecef;
            border-radius: 3px;
            overflow: hidden;
            margin: 20px 0;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            width: ${summary.successRate}%;
            transition: width 1s ease;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎭 PMI Lakeshore Test Report</h1>
            <p>Generated on ${summary.endTime.toLocaleString()}</p>
            <div class="progress-bar">
                <div class="progress-fill"></div>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card stat-total">
                <span class="stat-number">${summary.totalTests}</span>
                <span class="stat-label">Total Tests</span>
            </div>
            <div class="stat-card stat-passed">
                <span class="stat-number">${summary.passedTests}</span>
                <span class="stat-label">Passed</span>
            </div>
            <div class="stat-card stat-failed">
                <span class="stat-number">${summary.failedTests}</span>
                <span class="stat-label">Failed</span>
            </div>
            <div class="stat-card stat-rate">
                <span class="stat-number">${summary.successRate}%</span>
                <span class="stat-label">Success Rate</span>
            </div>
        </div>

        <div class="content">
            <h2>📋 Test Execution Details</h2>

            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Execution Time</div>
                    <div class="detail-value">${summary.totalDuration}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Start Time</div>
                    <div class="detail-value">${summary.startTime.toLocaleString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">End Time</div>
                    <div class="detail-value">${summary.endTime.toLocaleString()}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Browser</div>
                    <div class="detail-value">Chromium (Visible Mode)</div>
                </div>
            </div>

            <div class="test-list">
                ${summary.testResults.map((testResult: any, index: number) => `
                <div class="test-item ${testResult.status}">
                    <div class="test-header" onclick="toggleDetails(${index})">
                        <div class="test-title">
                            ${testResult.test.title}
                            <br><small style="color: #6c757d; font-weight: normal;">
                                ${testResult.test.location.file.split('/').pop()} • ${testResult.duration}ms
                            </small>
                        </div>
                        <span class="test-status status-${testResult.status}">
                            ${testResult.status === 'passed' ? '✅ Passed' : testResult.status === 'failed' ? '❌ Failed' : '⚠️ ' + testResult.status}
                        </span>
                    </div>
                    <div class="test-details" id="details-${index}">
                        <div class="detail-grid">
                            <div class="detail-item">
                                <div class="detail-label">Duration</div>
                                <div class="detail-value">${testResult.duration}ms</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">File</div>
                                <div class="detail-value">${testResult.test.location.file.split('/').pop()}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Line</div>
                                <div class="detail-value">${testResult.test.location.line}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Status</div>
                                <div class="detail-value">${testResult.status}</div>
                            </div>
                        </div>

                        ${testResult.errors.length > 0 ? `
                        <h4>🚨 Errors</h4>
                        ${testResult.errors.map((error: string) => `
                        <div class="error-box">${error}</div>
                        `).join('')}
                        ` : ''}

                        ${testResult.screenshots.length > 0 ? `
                        <h4>📸 Screenshots</h4>
                        <div class="screenshot-grid">
                            ${testResult.screenshots.map((screenshot: string) => `
                            <div class="screenshot-item">
                                <div>📷 ${screenshot.split('/').pop()}</div>
                            </div>
                            `).join('')}
                        </div>
                        ` : ''}
                    </div>
                </div>
                `).join('')}
            </div>
        </div>

        <div class="footer">
            Generated by PMI Lakeshore Custom Test Reporter • Playwright ${new Date().getFullYear()}
        </div>
    </div>

    <script>
        function toggleDetails(index) {
            const details = document.getElementById('details-' + index);
            details.classList.toggle('show');
        }

        // Auto-expand failed tests
        document.addEventListener('DOMContentLoaded', function() {
            ${summary.testResults.map((result: any, index: number) =>
              result.status === 'failed' ? `toggleDetails(${index});` : ''
            ).join('')}
        });
    </script>
</body>
</html>`;

    writeFileSync(join(this.reportDir, 'pmiloc-test-report.html'), html);
  }

  private generateJsonReport(summary: any) {
    const jsonReport = {
      summary: {
        totalTests: summary.totalTests,
        passedTests: summary.passedTests,
        failedTests: summary.failedTests,
        skippedTests: summary.skippedTests,
        successRate: summary.successRate,
        totalDuration: summary.totalDuration,
        startTime: summary.startTime.toISOString(),
        endTime: summary.endTime.toISOString()
      },
      tests: summary.testResults.map((result: any) => ({
        title: result.test.title,
        file: result.test.location.file,
        line: result.test.location.line,
        status: result.status,
        duration: result.duration,
        errors: result.errors,
        screenshots: result.screenshots,
        logs: result.logs
      }))
    };

    writeFileSync(
      join(this.reportDir, 'pmiloc-test-results.json'),
      JSON.stringify(jsonReport, null, 2)
    );
  }
}

export default CustomPMIReporter;