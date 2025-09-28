import { test, expect } from '@playwright/test';
import { getMCPConfig } from '../config/mcp-config';

test.describe('MCP Integration Tests', () => {
  let mcpConfig: ReturnType<typeof getMCPConfig>;

  test.beforeAll(async () => {
    mcpConfig = getMCPConfig();
  });

  test('should verify MCP configuration', async () => {
    expect(mcpConfig).toBeDefined();
    expect(mcpConfig.browser).toBeDefined();
    expect(mcpConfig.timeouts).toBeDefined();
    expect(mcpConfig.retries).toBeDefined();
  });

  test('should use MCP browser configuration', async ({ page }) => {
    // Set viewport according to MCP config
    await page.setViewportSize(mcpConfig.browser.viewport);

    await page.goto('https://example.com');

    // Verify viewport dimensions
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(mcpConfig.browser.viewport.width);
    expect(viewport?.height).toBe(mcpConfig.browser.viewport.height);
  });

  test('should handle timeouts according to MCP config', async ({ page }) => {
    // Override default timeout with MCP config
    page.setDefaultTimeout(mcpConfig.timeouts.action);

    await page.goto('https://httpbin.org/delay/2');

    // This should complete within the configured timeout
    await expect(page.locator('body')).toBeVisible();
  });

  test('should demonstrate browser automation capabilities', async ({ page }) => {
    await page.goto('https://httpbin.org/forms/post');

    // Fill out a form
    await page.fill('input[name="custname"]', 'Test User');
    await page.fill('input[name="custtel"]', '1234567890');
    await page.fill('input[name="custemail"]', 'test@example.com');
    await page.selectOption('select[name="size"]', 'medium');

    // Submit form
    await page.click('input[type="submit"]');

    // Verify submission
    await expect(page.locator('pre')).toContainText('Test User');
  });

  test('should capture network requests', async ({ page }) => {
    const requests: string[] = [];

    // Listen for all requests
    page.on('request', request => {
      requests.push(request.url());
    });

    await page.goto('https://jsonplaceholder.typicode.com/posts/1');

    // Verify we captured the main request
    expect(requests).toContain('https://jsonplaceholder.typicode.com/posts/1');
  });
});