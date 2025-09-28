import { writeFileSync } from 'fs';
import { TestLogger } from './logger';

export class TestReporter {
  private reports: Array<any> = [];

  addTestReport(logger: TestLogger) {
    const summary = logger.getExecutionSummary();
    this.reports.push(summary);
  }

  generateHtmlReport(): string {
    const totalTests = this.reports.length;
    const successfulTests = this.reports.filter(r => r.logsByLevel.ERROR === 0).length;
    const failedTests = totalTests - successfulTests;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PMI Lakeshore Test Execution Report</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #2c3e50, #34495e);
            color: white;
            padding: 20px;
            margin: -30px -30px 30px -30px;
            border-radius: 8px 8px 0 0;
        }
        .summary-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            border-left: 4px solid #007bff;
            text-align: center;
        }
        .card.success { border-left-color: #28a745; }
        .card.error { border-left-color: #dc3545; }
        .card.warning { border-left-color: #ffc107; }
        .card-number {
            font-size: 2em;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .test-section {
            margin-bottom: 30px;
        }
        .test-header {
            background: #e9ecef;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .test-logs {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            max-height: 400px;
            overflow-y: auto;
        }
        .log-entry {
            padding: 8px 15px;
            border-bottom: 1px solid #dee2e6;
            font-family: 'Monaco', 'Consolas', monospace;
            font-size: 0.9em;
        }
        .log-entry:last-child { border-bottom: none; }
        .log-info { background: #fff; }
        .log-success { background: #d4edda; color: #155724; }
        .log-error { background: #f8d7da; color: #721c24; }
        .log-warning { background: #fff3cd; color: #856404; }
        .timestamp {
            color: #6c757d;
            font-size: 0.8em;
        }
        .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
        }
        .status-success {
            background: #d4edda;
            color: #155724;
        }
        .status-error {
            background: #f8d7da;
            color: #721c24;
        }
        .collapsible {
            cursor: pointer;
            user-select: none;
        }
        .collapsible:hover {
            background: #dee2e6;
        }
        .content {
            display: none;
        }
        .content.active {
            display: block;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎭 PMI Lakeshore Test Execution Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>

        <div class="summary-cards">
            <div class="card">
                <div class="card-number">${totalTests}</div>
                <div>Total Tests</div>
            </div>
            <div class="card success">
                <div class="card-number">${successfulTests}</div>
                <div>Passed</div>
            </div>
            <div class="card error">
                <div class="card-number">${failedTests}</div>
                <div>Failed</div>
            </div>
            <div class="card">
                <div class="card-number">${((successfulTests / totalTests) * 100).toFixed(1)}%</div>
                <div>Success Rate</div>
            </div>
        </div>

        ${this.reports.map((report, index) => `
        <div class="test-section">
            <div class="test-header collapsible" onclick="toggleContent(${index})">
                <div>
                    <h3>${report.testName}</h3>
                    <small>Duration: ${report.duration} | Logs: ${report.totalLogs}</small>
                </div>
                <span class="status-badge ${report.logsByLevel.ERROR > 0 ? 'status-error' : 'status-success'}">
                    ${report.logsByLevel.ERROR > 0 ? '❌ FAILED' : '✅ PASSED'}
                </span>
            </div>
            <div class="content" id="content-${index}">
                <div class="test-logs">
                    ${report.logs.map(log => `
                    <div class="log-entry log-${log.level.toLowerCase()}">
                        <span class="timestamp">[${log.timestamp.toISOString()}]</span>
                        <strong>[${log.level}]</strong> ${log.message}
                        ${log.data ? `<br><small style="margin-left: 20px;">${JSON.stringify(log.data)}</small>` : ''}
                    </div>
                    `).join('')}
                </div>
            </div>
        </div>
        `).join('')}
    </div>

    <script>
        function toggleContent(index) {
            const content = document.getElementById('content-' + index);
            content.classList.toggle('active');
        }
    </script>
</body>
</html>`;

    return html;
  }

  saveReport(filename: string = 'test-execution-report.html') {
    const html = this.generateHtmlReport();
    writeFileSync(filename, html);
    console.log(`📊 Test report saved as: ${filename}`);
  }

  printSummary() {
    const totalTests = this.reports.length;
    const successfulTests = this.reports.filter(r => r.logsByLevel.ERROR === 0).length;
    const failedTests = totalTests - successfulTests;

    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST EXECUTION SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${successfulTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((successfulTests / totalTests) * 100).toFixed(1)}%`);
    console.log('='.repeat(60));

    if (failedTests > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.reports
        .filter(r => r.logsByLevel.ERROR > 0)
        .forEach(r => {
          console.log(`  - ${r.testName} (${r.logsByLevel.ERROR} errors)`);
        });
    }
  }
}