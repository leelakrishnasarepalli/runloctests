import { test } from '@playwright/test';

export class TestLogger {
  private testName: string;
  private startTime: Date;
  private logs: Array<{ timestamp: Date; level: string; message: string; data?: any }> = [];

  constructor(testName: string) {
    this.testName = testName;
    this.startTime = new Date();
  }

  info(message: string, data?: any) {
    const log = {
      timestamp: new Date(),
      level: 'INFO',
      message,
      data
    };
    this.logs.push(log);
    console.log(`[${log.timestamp.toISOString()}] [INFO] ${this.testName}: ${message}`, data || '');
  }

  success(message: string, data?: any) {
    const log = {
      timestamp: new Date(),
      level: 'SUCCESS',
      message,
      data
    };
    this.logs.push(log);
    console.log(`[${log.timestamp.toISOString()}] [✅ SUCCESS] ${this.testName}: ${message}`, data || '');
  }

  error(message: string, error?: Error | any) {
    const log = {
      timestamp: new Date(),
      level: 'ERROR',
      message,
      data: error?.message || error
    };
    this.logs.push(log);
    console.error(`[${log.timestamp.toISOString()}] [❌ ERROR] ${this.testName}: ${message}`, error || '');
  }

  warning(message: string, data?: any) {
    const log = {
      timestamp: new Date(),
      level: 'WARNING',
      message,
      data
    };
    this.logs.push(log);
    console.warn(`[${log.timestamp.toISOString()}] [⚠️ WARNING] ${this.testName}: ${message}`, data || '');
  }

  step(stepName: string) {
    this.info(`🔄 STEP: ${stepName}`);
  }

  getLogs() {
    return this.logs;
  }

  getExecutionSummary() {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();

    const summary = {
      testName: this.testName,
      startTime: this.startTime,
      endTime,
      duration: `${duration}ms`,
      totalLogs: this.logs.length,
      logsByLevel: {
        INFO: this.logs.filter(l => l.level === 'INFO').length,
        SUCCESS: this.logs.filter(l => l.level === 'SUCCESS').length,
        ERROR: this.logs.filter(l => l.level === 'ERROR').length,
        WARNING: this.logs.filter(l => l.level === 'WARNING').length
      },
      logs: this.logs
    };

    return summary;
  }
}