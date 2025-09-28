import { Page, Locator } from '@playwright/test';
import { TestLogger } from '../utils/logger';

export abstract class BasePage {
  protected page: Page;
  protected logger: TestLogger;

  constructor(page: Page, logger: TestLogger) {
    this.page = page;
    this.logger = logger;
  }

  async navigateTo(url: string): Promise<void> {
    try {
      this.logger.step(`Navigating to: ${url}`);
      await this.page.goto(url);
      await this.page.waitForLoadState('networkidle');
      this.logger.success(`Successfully navigated to: ${url}`);
    } catch (error) {
      this.logger.error(`Failed to navigate to: ${url}`, error);
      throw error;
    }
  }

  async clickElement(locator: Locator, description: string): Promise<void> {
    try {
      this.logger.step(`Clicking: ${description}`);
      await locator.waitFor({ state: 'visible', timeout: 60000 });
      await locator.click();
      this.logger.success(`Successfully clicked: ${description}`);
    } catch (error) {
      this.logger.error(`Failed to click: ${description}`, error);
      throw error;
    }
  }

  async fillInput(locator: Locator, value: string, description: string): Promise<void> {
    try {
      this.logger.step(`Filling ${description} with: ${value}`);
      await locator.waitFor({ state: 'visible', timeout: 60000 });
      await locator.clear();
      await locator.fill(value);
      this.logger.success(`Successfully filled ${description}`);
    } catch (error) {
      this.logger.error(`Failed to fill ${description}`, error);
      throw error;
    }
  }

  async waitForElement(locator: Locator, description: string, timeout: number = 60000): Promise<void> {
    try {
      this.logger.step(`Waiting for: ${description}`);
      await locator.waitFor({ state: 'visible', timeout });
      this.logger.success(`Element appeared: ${description}`);
    } catch (error) {
      this.logger.error(`Element not found: ${description}`, error);
      throw error;
    }
  }

  async getElementText(locator: Locator, description: string): Promise<string> {
    try {
      this.logger.step(`Getting text from: ${description}`);
      await locator.waitFor({ state: 'visible', timeout: 60000 });
      const text = await locator.textContent() || '';
      this.logger.success(`Retrieved text from ${description}: ${text.substring(0, 100)}...`);
      return text;
    } catch (error) {
      this.logger.error(`Failed to get text from: ${description}`, error);
      throw error;
    }
  }

  async takeScreenshot(name: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `screenshot-${name}-${timestamp}.png`;
      await this.page.screenshot({ path: `test-results/${filename}`, fullPage: true });
      this.logger.info(`Screenshot saved: ${filename}`);
    } catch (error) {
      this.logger.warning(`Failed to take screenshot: ${name}`, error);
    }
  }

  async getCurrentUrl(): Promise<string> {
    const url = this.page.url();
    this.logger.info(`Current URL: ${url}`);
    return url;
  }

  async waitForNavigation(expectedUrl?: string): Promise<void> {
    try {
      this.logger.step('Waiting for page navigation');
      await this.page.waitForLoadState('networkidle');

      if (expectedUrl) {
        const currentUrl = await this.getCurrentUrl();
        if (currentUrl.includes(expectedUrl)) {
          this.logger.success(`Navigation successful to: ${currentUrl}`);
        } else {
          this.logger.warning(`Expected URL pattern '${expectedUrl}' not found in '${currentUrl}'`);
        }
      } else {
        this.logger.success('Navigation completed');
      }
    } catch (error) {
      this.logger.error('Navigation failed', error);
      throw error;
    }
  }

  async handleDialog(accept: boolean = true): Promise<void> {
    this.page.on('dialog', async dialog => {
      this.logger.info(`Dialog appeared: ${dialog.message()}`);
      if (accept) {
        await dialog.accept();
        this.logger.success('Dialog accepted');
      } else {
        await dialog.dismiss();
        this.logger.success('Dialog dismissed');
      }
    });
  }

  async closeBrowser(): Promise<void> {
    try {
      this.logger.step('Closing browser');
      await this.page.context().close();
      this.logger.success('Browser closed successfully');
    } catch (error) {
      this.logger.error('Failed to close browser', error);
    }
  }
}