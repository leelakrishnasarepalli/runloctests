# 🎭 PMI Lakeshore Event Testing Suite

Advanced test automation for PMI Lakeshore event navigation with comprehensive logging, reporting, and page object model architecture.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run both event tests with visible browser
npm run test:events

# Run individual tests
npm run test:event    # Event navigation test
npm run test:banner   # Banner image navigation test

# View custom reports
npm run report:custom
```

## 📁 Project Structure

```
tests/
├── pages/                      # Page Object Model
│   ├── base.page.ts           # Base page with common functionality
│   ├── homepage.page.ts       # PMI homepage interactions
│   ├── event-details.page.ts  # Event details page
│   └── registration.page.ts   # Registration/guest signup
├── utils/                      # Test utilities
│   ├── logger.ts              # Detailed test logging
│   ├── reporter.ts            # HTML/JSON report generator
│   └── custom-reporter.ts     # Playwright custom reporter
├── pmiloc-event-navigation.spec.ts     # Main event navigation test
├── pmiloc-banner-navigation.spec.ts    # Banner image navigation test
└── run-event-tests.ts                  # Test suite runner
```

## 🎯 Test Scenarios

### Test 1: Event Navigation Flow
**File**: `pmiloc-event-navigation.spec.ts`

**Steps Performed**:
1. ✅ Navigate to PMI Lakeshore homepage
2. ✅ Scroll to events section and scan available events
3. ✅ Click "View Details" on first event
4. ✅ Extract event information (title, date, time, location)
5. ✅ Click "Register" button
6. ✅ Continue as guest (if available)
7. ✅ Fill guest registration form
8. ✅ Submit registration
9. ✅ Check for confirmation
10. ✅ Close browser

**Logging Features**:
- Step-by-step operation logging
- Error capture with screenshots
- Performance timing
- Event information extraction
- Registration form analysis

### Test 2: Banner Image Navigation
**File**: `pmiloc-banner-navigation.spec.ts`

**Steps Performed**:
1. ✅ Navigate to PMI Lakeshore homepage
2. ✅ Scan for clickable banner/carousel images
3. ✅ Click first available banner image
4. ✅ Verify navigation to event page
5. ✅ Complete event registration flow
6. ✅ Catalog all clickable elements
7. ✅ Close browser

**Advanced Features**:
- Multiple image selector strategies
- Fallback navigation methods
- Element discovery and cataloging
- Smart image detection

## 🔧 Page Object Model

### BasePage
Core functionality for all pages:
- Navigation with error handling
- Element interaction with retries
- Screenshot capture
- Detailed logging
- Browser management

### HomePage
PMI Lakeshore homepage interactions:
- Event section scanning
- Banner image handling
- Navigation menu interaction
- Quick links access

### EventDetailsPage
Event details page functionality:
- Event information extraction
- Registration availability check
- Register button interaction
- Page verification

### RegistrationPage
Registration form handling:
- Guest registration flow
- Form field detection
- Data entry automation
- Confirmation checking

## 📊 Reporting & Logging

### Custom Reporter
**File**: `tests/utils/custom-reporter.ts`

**Features**:
- Interactive HTML reports
- Real-time console logging
- Test execution summary
- Error highlighting
- Screenshot integration
- JSON data export

### Test Logger
**File**: `tests/utils/logger.ts`

**Capabilities**:
- Structured logging (INFO, SUCCESS, ERROR, WARNING)
- Step tracking
- Performance monitoring
- Data capture
- Execution summaries

### Generated Reports
1. **`pmiloc-test-report.html`** - Interactive HTML report
2. **`pmiloc-test-results.json`** - Raw JSON data
3. **`event-navigation-report.html`** - Event test specific
4. **`banner-navigation-report.html`** - Banner test specific

## 🎛️ Configuration

### Playwright Config
**File**: `playwright.config.ts`

**Key Settings**:
```typescript
{
  headless: false,           // Always visible browser
  slowMo: 500,              // Slow motion for visibility
  viewport: { width: 1920, height: 1080 },
  timeout: 120000,          // 2 minutes per test
  retries: 1,               // Allow retries for flaky tests
  workers: 1,               // Single worker for visibility
  screenshot: 'only-on-failure',
  video: 'retain-on-failure'
}
```

### Environment Variables
```bash
# Set custom base URL
BASE_URL=https://staging.pmiloc.org

# Force headless mode
CI=true

# Enable debug logging
DEBUG=pw:api
```

## 🚀 Running Tests

### Individual Test Commands
```bash
# Event navigation test only
npm run test:event

# Banner navigation test only
npm run test:banner

# All tests with visible browser
npm run test:visible

# All tests (includes other test files)
npm test

# Debug mode with Playwright inspector
npm run test:debug

# UI mode for interactive testing
npm run test:ui
```

### Test Suite Runner
```bash
# Run complete event testing suite
npm run test:events
```

This command:
- Runs both event navigation tests sequentially
- Provides enhanced console output
- Generates comprehensive reports
- Handles errors gracefully
- Shows execution summary

## 📸 Screenshots & Videos

### Automatic Capture
- **Screenshots**: Taken on failures and key steps
- **Videos**: Recorded for failed tests
- **Error Screenshots**: Captured during exceptions

### Manual Screenshots
```typescript
// In page objects
await homePage.takeScreenshot('homepage-loaded');
await eventDetailsPage.takeEventScreenshot();
await registrationPage.takeRegistrationScreenshot();
```

## 🔍 Error Handling

### Comprehensive Error Logging
- JavaScript console errors
- Network request failures
- Element interaction failures
- Navigation timeouts
- Registration form issues

### Recovery Strategies
- Element selector fallbacks
- Alternative navigation paths
- Retry mechanisms
- Graceful degradation

## 📋 Test Data

### Guest Registration Info
```typescript
const guestInfo = {
  firstName: 'Test',
  lastName: 'User',
  email: 'test.user@example.com',
  phone: '555-0123',
  organization: 'Test Organization'
};
```

### Dynamic Event Detection
- Scans homepage for available events
- Extracts event metadata
- Handles multiple event formats
- Adapts to page changes

## 🛠️ Troubleshooting

### Common Issues

1. **Browser Not Opening**
   ```bash
   npx playwright install chromium
   npm run test:visible
   ```

2. **Tests Timing Out**
   ```bash
   # Increase timeout in playwright.config.ts
   timeout: 180000  // 3 minutes
   ```

3. **Element Not Found**
   - Check page object selectors
   - Verify page load completion
   - Review error screenshots

4. **Registration Failing**
   - Verify guest option availability
   - Check form field requirements
   - Review registration page structure

### Debug Commands
```bash
# Run with debug logging
DEBUG=pw:api npm run test:event

# Generate trace files
npx playwright test --trace=on

# Show browser developer tools
npx playwright test --debug
```

## 🔄 CI/CD Integration

### GitHub Actions
The tests automatically switch to headless mode in CI:
```yaml
env:
  CI: true
  BASE_URL: https://pmiloc.org
```

### Local Development
Always runs in visible mode for debugging:
```bash
headless: process.env.CI ? true : false
```

## 📈 Performance Monitoring

### Metrics Tracked
- Navigation timing
- Element interaction speed
- Form submission time
- Page load performance
- Test execution duration

### Optimization Tips
- Use specific selectors
- Implement smart waits
- Minimize unnecessary actions
- Cache page objects
- Optimize screenshot capture

## 🎉 Success Criteria

### Test Pass Conditions
1. ✅ Successfully navigates to events
2. ✅ Extracts event information
3. ✅ Completes registration flow
4. ✅ Handles errors gracefully
5. ✅ Generates comprehensive reports
6. ✅ Closes browser properly

### Quality Gates
- All steps logged with timestamps
- Screenshots captured for key actions
- Error messages detailed and actionable
- Performance within acceptable limits
- Reports generated successfully

---

**🎭 Happy Testing with PMI Lakeshore Event Automation!**

For questions or issues, check the generated reports in `test-results/` directory.