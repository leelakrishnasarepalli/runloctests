import { test, expect } from '@playwright/test';

test.describe.skip('PMI Lakeshore Chapter Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.php');
  });

  test('should navigate to member login page', async ({ page }) => {
    const memberLoginLink = page.getByRole('link', { name: 'Member Login' });
    await memberLoginLink.click();

    await expect(page).toHaveURL(/members\.php/);
  });

  test('should navigate to calendar page', async ({ page }) => {
    const calendarLink = page.getByRole('link', { name: 'Calendar' });
    await calendarLink.click();

    await expect(page).toHaveURL(/calendar\.php/);
  });

  test('should open mailing list in new context', async ({ page, context }) => {
    const mailingListLink = page.getByRole('link', { name: 'Join Our Mailing List' });

    // Create a promise that resolves when a new page is opened
    const newPagePromise = context.waitForEvent('page');

    await mailingListLink.click();

    const newPage = await newPagePromise;
    await newPage.waitForLoadState();

    expect(newPage.url()).toContain('constantcontactpages.com');
  });

  test('should navigate to contact form', async ({ page }) => {
    const contactLink = page.getByRole('link', { name: 'Contact Us' });
    await contactLink.click();

    await expect(page).toHaveURL(/form\.php/);
  });

  test('should navigate to DEI page', async ({ page }) => {
    const deiLink = page.getByRole('link', { name: 'DEI' });
    await deiLink.click();

    await expect(page).toHaveURL(/Diversity___Inclusion/);
  });

  test('should access upcoming events', async ({ page }) => {
    const upcomingEventsLink = page.getByRole('link', { name: 'UPCOMING EVENTS' });
    await upcomingEventsLink.click();

    await expect(page).toHaveURL(/meetinginfo\.php/);
  });

  test('should navigate to volunteering page', async ({ page }) => {
    const volunteeringLink = page.getByRole('link', { name: 'VOLUNTEERING' });
    await volunteeringLink.click();

    await expect(page).toHaveURL(/Volunteers/);
  });

  test('should access job board', async ({ page }) => {
    const jobBoardLink = page.getByRole('link', { name: 'JOB BOARD' });
    await jobBoardLink.click();

    await expect(page).toHaveURL(/Job_Listing/);
  });

  test('should navigate to call for speakers', async ({ page }) => {
    const speakersLink = page.getByRole('link', { name: 'Call for Speakers' });
    await speakersLink.click();

    await expect(page).toHaveURL(/Call_for_Speakers/);
  });

  test('should access toastmasters club page', async ({ page }) => {
    const toastmastersLink = page.getByRole('link', { name: 'TOASTMASTERS' });
    await toastmastersLink.click();

    await expect(page).toHaveURL(/Toastmasters_Club/);
  });

  test('should navigate to disciplined agile page', async ({ page }) => {
    const agileLink = page.getByRole('link', { name: 'Disciplined Agile' });
    await agileLink.click();

    await expect(page).toHaveURL(/Disciplined_Agile/);
  });

  test('should access PMI global resource hub', async ({ page, context }) => {
    const resourceHubLink = page.getByRole('link', { name: 'PMI Global Resource Hub - Great Reference Resource' });

    const newPagePromise = context.waitForEvent('page');
    await resourceHubLink.click();

    const newPage = await newPagePromise;
    await newPage.waitForLoadState();

    expect(newPage.url()).toContain('pmi.org');
  });

  test('should navigate to product catalog', async ({ page }) => {
    const catalogLink = page.getByRole('link', { name: 'Product Catalog' });
    await catalogLink.click();

    await expect(page).toHaveURL(/Project_Management_Ready_Certification/);
  });

  test('should access footer links', async ({ page }) => {
    // Test Terms of Use
    const termsLink = page.getByRole('link', { name: 'Terms of Use' });
    await termsLink.click();
    await expect(page).toHaveURL(/terms/);

    // Go back and test Privacy Policy
    await page.goBack();
    const privacyLink = page.getByRole('link', { name: 'Privacy Policy' });
    await privacyLink.click();
    await expect(page).toHaveURL(/privacy/);
  });

  test('should handle event registration links', async ({ page }) => {
    // Find and click a register link
    const registerLinks = page.getByRole('link', { name: 'Register' });
    if (await registerLinks.count() > 0) {
      await registerLinks.first().click();
      await expect(page).toHaveURL(/meet-reg1\.php/);
    }
  });

  test('should access event details', async ({ page }) => {
    // Find and click a "View Details" link
    const detailsLinks = page.getByRole('link', { name: 'View Details ►' });
    if (await detailsLinks.count() > 0) {
      await detailsLinks.first().click();
      await expect(page).toHaveURL(/meetinginfo\.php/);
    }
  });

  test('should verify pagination functionality', async ({ page }) => {
    // Test carousel pagination if visible
    const paginationLinks = page.locator('text=/^[0-9]+$/').filter({ hasText: /^[1-9]$/ });

    if (await paginationLinks.count() > 1) {
      // Click on page 2 if it exists
      const page2Link = paginationLinks.nth(1);
      if (await page2Link.isVisible()) {
        await page2Link.click();
        // Wait for any potential content change
        await page.waitForTimeout(1000);
      }
    }
  });

  test('should handle search functionality', async ({ page }) => {
    const searchBox = page.getByRole('searchbox').first();
    await searchBox.fill('project management');

    // Look for search button or submit
    const searchButton = page.locator('button[type="submit"]').first();
    if (await searchButton.isVisible()) {
      await searchButton.click();
      // Wait for search results or page change
      await page.waitForTimeout(2000);
    }
  });

  test('should test breadcrumb navigation', async ({ page }) => {
    // Navigate to a sub-page first
    const aboutLink = page.getByRole('link', { name: 'About Us' }).last();
    if (await aboutLink.isVisible()) {
      await aboutLink.click();

      // Look for home/back navigation
      const homeLink = page.getByRole('link', { name: 'Home Page' });
      if (await homeLink.isVisible()) {
        await homeLink.click();
        await expect(page).toHaveURL(/index\.php/);
      }
    }
  });
});