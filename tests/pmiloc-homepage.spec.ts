import { test, expect } from '@playwright/test';

test.describe.skip('PMI Lakeshore Chapter Homepage Tests', () => {
  // Use beforeAll to navigate once and reuse the browser
  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto('/index.php');
    // Store context for reuse - but we'll handle this in individual tests
  });

  test.beforeEach(async ({ page }) => {
    // Only navigate if not already on the homepage
    if (!page.url().includes('index.php')) {
      await page.goto('/index.php');
    }
  });

  test('should load homepage and verify title', async ({ page }) => {
    await expect(page).toHaveTitle('PMI Lakeshore Chapter - Home Page');
  });

  test('should display main heading', async ({ page }) => {
    const mainHeading = page.locator('h1');
    await expect(mainHeading).toBeVisible();
    await expect(mainHeading).toContainText('Welcome to PMI Lakeshore Ontario Chapter (PMILOC)!');
  });

  test('should have functional navigation menu', async ({ page }) => {
    // Test main navigation items
    await expect(page.locator('text=About Us')).toBeVisible();
    await expect(page.locator('text=Member Care')).toBeVisible();
    await expect(page.locator('text=Events')).toBeVisible();
    await expect(page.locator('text=Professional Development')).toBeVisible();

    // Test clickable DEI link
    const deiLink = page.getByRole('link', { name: 'DEI' });
    await expect(deiLink).toBeVisible();
    await expect(deiLink).toHaveAttribute('href', 'https://pmiloc.org/Diversity___Inclusion');
  });

  test('should have working search functionality', async ({ page }) => {
    const searchBox = page.getByRole('searchbox', { name: 'Press Enter to submit your search' });
    await expect(searchBox).toBeVisible();

    // Test search input
    await searchBox.fill('project management');
    await expect(searchBox).toHaveValue('project management');
  });

  test('should display member login section', async ({ page }) => {
    const loginSection = page.locator('text=Member Area Login');
    await expect(loginSection).toBeVisible();

    const loginLink = page.getByRole('link', { name: 'Login' }).first();
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute('href', 'members.php');
  });

  test('should show upcoming events section', async ({ page }) => {
    const eventsHeading = page.locator('text=Webinars & In Person Events');
    await expect(eventsHeading).toBeVisible();

    // Check for event registration links
    const registerLinks = page.getByRole('link', { name: 'Register' });
    await expect(registerLinks.first()).toBeVisible();
  });

  test('should have social media links in footer', async ({ page }) => {
    // Scroll to footer
    await page.locator('footer').scrollIntoViewIfNeeded();

    // Check social media links
    const facebookLink = page.getByRole('link', { name: 'Facebook' });
    await expect(facebookLink).toBeVisible();
    await expect(facebookLink).toHaveAttribute('href', 'https://www.facebook.com/PMILakeshoreChapter/');

    const twitterLink = page.getByRole('link', { name: 'Twitter' });
    await expect(twitterLink).toBeVisible();
    await expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/pmilakeshoresm');

    const linkedinLink = page.getByRole('link', { name: 'LinkedIn' });
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/company/24784748/');
  });

  test('should display contact information', async ({ page }) => {
    const contactEmail = page.getByRole('link', { name: 'info@pmiloc.org' });
    await expect(contactEmail).toBeVisible();
    await expect(contactEmail).toHaveAttribute('href', 'mailto:info@pmiloc.org');
  });

  test('should have quick links section', async ({ page }) => {
    const quickLinksHeading = page.locator('text=Quick Links');
    await expect(quickLinksHeading).toBeVisible();

    const aboutUsLink = page.getByRole('link', { name: 'About Us' }).last();
    await expect(aboutUsLink).toBeVisible();

    const calendarLink = page.getByRole('link', { name: 'Calendar of Events' });
    await expect(calendarLink).toBeVisible();
  });

  test('should display sponsors section', async ({ page }) => {
    const sponsorsHeading = page.locator('text=Our Sponsors');
    await expect(sponsorsHeading).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('h1')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should verify important external links work', async ({ page }) => {
    // Test mailing list link
    const mailingListLink = page.getByRole('link', { name: 'Join Our Chapter Mailing List' });
    await expect(mailingListLink).toBeVisible();
    await expect(mailingListLink).toHaveAttribute('href', 'https://lp.constantcontactpages.com/su/4r5n6FI');

    // Test donation link
    const donationLink = page.getByRole('link', { name: 'Donate Here - Diabetes Canada.' });
    await expect(donationLink).toBeVisible();
    await expect(donationLink).toHaveAttribute('href', /diabetes\.ca/);
  });
});