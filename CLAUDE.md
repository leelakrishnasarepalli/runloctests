# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Playwright-based test automation suite for the PMI Lakeshore Ontario Chapter website (pmiloc.org). It's designed as a zero-cost cloud testing solution with GitHub Actions CI/CD integration and webhook triggers for manual test execution.

## Key Commands

### Test Execution
```bash
npm test                    # Run all pmiloc.org tests
npm run test:headed         # Run with visible browser UI
npm run test:debug          # Debug mode with Playwright inspector
npm run test:ui             # Interactive Playwright UI mode
npm run test:events         # Complete event testing suite
npm run test:event          # Event navigation test only
npm run test:banner         # Banner image navigation test only
```

### Setup & Installation
```bash
npm install                 # Install dependencies
npx playwright install      # Install browser binaries
npm run install:browsers    # Alternative browser installation
```

### Reporting
```bash
npm run report              # Open HTML report
npm run report:custom       # Open PMI-branded custom report
```

## Architecture

### Page Object Model Structure
- **BasePage** (`tests/pages/base.page.ts`): Abstract base class with common functionality including navigation, element interaction, and screenshot capture
- **Page Objects**: Homepage, Event Details, and Registration pages extend BasePage
- **Test Organization**: Spec files organized by functionality (homepage, events, navigation, accessibility)

### Configuration
- **Playwright Config** (`playwright.config.ts`): Single-worker execution, 2-minute test timeout, retry logic (2 in CI, 1 locally)
- **MCP Integration** (`config/mcp-config.ts`): Model Context Protocol server configuration with dynamic headless mode and browser viewport management

### Utilities
- **Logger** (`tests/utils/logger.ts`): Structured logging with INFO, SUCCESS, ERROR, WARNING levels
- **Custom Reporter** (`tests/utils/custom-reporter.ts`): Rich HTML reports with PMI branding and progress visualization

## Testing Approach

### Core Test Scenarios
1. **Homepage Validation**: Title verification and navigation menu checks
2. **Event Discovery**: Dynamic event scanning and metadata extraction
3. **Registration Flows**: Guest registration automation with form validation
4. **Banner Navigation**: Carousel interaction testing with fallback strategies
5. **Accessibility Compliance**: WCAG guideline validation

### Key Patterns
- **Error Recovery**: Multiple selector strategies with graceful degradation
- **Smart Waiting**: Network idle detection and element visibility checks
- **Screenshot Strategy**: Automatic capture on failures for debugging
- **Retry Mechanisms**: Built-in retries for flaky test scenarios

## CI/CD Integration

### GitHub Actions
- **Triggers**: Push to main/develop, pull requests, manual webhook dispatch
- **Artifact Management**: 30-day retention for reports, screenshots, videos
- **Cost Optimization**: Single browser matrix, efficient resource usage

### Environment Variables
- `BASE_URL`: Target website (defaults to https://pmiloc.org)
- `CI`: Enables headless mode and CI optimizations
- `HEADLESS`: Forces headless mode regardless of CI setting
- `WEBHOOK_NOTIFICATION_URL`: Optional result notification endpoint

## Security Guidelines

### Important Security Practices
- **Never commit API keys, tokens, or secrets** to the repository
- Use environment variables for sensitive configuration (`.env` files in `.gitignore`)
- Be cautious with GitHub API keys, webhook URLs, and authentication tokens
- Review commits before pushing to ensure no sensitive data is included

## Development Notes

### Browser Configuration
- **Primary**: Chromium (cost-optimized for CI)
- **Local Development**: Visible browser with slow-motion (500ms) for debugging
- **Viewport**: 1280x720 default, configurable per environment

### Timeout Strategy
- **Navigation**: 60 seconds maximum
- **Actions**: 60 seconds maximum
- **Assertions**: 60 seconds maximum
- **Global Test**: 60 seconds with 10-minute global timeout
- **All Web Operations**: Never exceed 60 seconds to ensure efficient automation

### Performance Considerations
- Single worker execution prevents resource conflicts during visible testing
- Network idle detection ensures complete page loads
- Selective browser installation (Chromium-only) for cloud cost optimization