# Webhook Trigger Examples

This document provides practical examples for triggering tests via GitHub's repository dispatch API.

## Basic Setup

First, create a GitHub Personal Access Token:
1. Go to GitHub Settings > Developer settings > Personal access tokens
2. Create a new token with `repo` scope
3. Save the token securely

## Example Webhook Calls

### 1. Trigger All Tests

```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches \
  -d '{
    "event_type": "manual-trigger"
  }'
```

### 2. Run Specific Test Suite

```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches \
  -d '{
    "event_type": "manual-trigger",
    "client_payload": {
      "test_suite": "homepage",
      "browser": "chromium"
    }
  }'
```

### 3. Cross-Browser Testing

```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches \
  -d '{
    "event_type": "manual-trigger",
    "client_payload": {
      "test_suite": "navigation",
      "browser": "firefox",
      "environment": "staging"
    }
  }'
```

### 4. Mobile Testing

```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/dispatches \
  -d '{
    "event_type": "manual-trigger",
    "client_payload": {
      "test_suite": "accessibility",
      "browser": "webkit"
    }
  }'
```

## JavaScript/Node.js Examples

### Simple Trigger Function

```javascript
const axios = require('axios');

async function triggerTests(testSuite = 'all', browser = 'chromium') {
  const response = await axios.post(
    `https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.GITHUB_REPO}/dispatches`,
    {
      event_type: 'manual-trigger',
      client_payload: {
        test_suite: testSuite,
        browser: browser,
        environment: process.env.NODE_ENV || 'production'
      }
    },
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    }
  );

  console.log('Tests triggered successfully:', response.status);
}

// Usage
triggerTests('homepage', 'firefox');
```

### Scheduled Testing Script

```javascript
const cron = require('node-cron');
const axios = require('axios');

// Run tests every day at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('Running scheduled tests...');

  await triggerTests('homepage', 'chromium');

  // Wait 30 minutes, then run full suite
  setTimeout(async () => {
    await triggerTests('all', 'firefox');
  }, 30 * 60 * 1000);
});

async function triggerTests(suite, browser) {
  try {
    await axios.post(/* ... same as above ... */);
    console.log(`${suite} tests triggered on ${browser}`);
  } catch (error) {
    console.error('Failed to trigger tests:', error.message);
  }
}
```

## Python Examples

### Basic Trigger

```python
import requests
import os

def trigger_tests(test_suite='all', browser='chromium', environment='production'):
    url = f"https://api.github.com/repos/{os.getenv('GITHUB_USER')}/{os.getenv('GITHUB_REPO')}/dispatches"

    headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': f"token {os.getenv('GITHUB_TOKEN')}"
    }

    data = {
        'event_type': 'manual-trigger',
        'client_payload': {
            'test_suite': test_suite,
            'browser': browser,
            'environment': environment
        }
    }

    response = requests.post(url, json=data, headers=headers)

    if response.status_code == 204:
        print(f"Tests triggered successfully: {test_suite} on {browser}")
    else:
        print(f"Failed to trigger tests: {response.status_code}")

# Usage
trigger_tests('navigation', 'webkit', 'staging')
```

### Test Suite Manager

```python
import requests
import time
import os
from datetime import datetime

class TestSuiteManager:
    def __init__(self):
        self.github_user = os.getenv('GITHUB_USER')
        self.github_repo = os.getenv('GITHUB_REPO')
        self.github_token = os.getenv('GITHUB_TOKEN')
        self.base_url = f"https://api.github.com/repos/{self.github_user}/{self.github_repo}"

    def trigger_test(self, test_suite, browser='chromium', environment='production'):
        """Trigger a specific test suite"""
        url = f"{self.base_url}/dispatches"

        headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': f"token {self.github_token}"
        }

        data = {
            'event_type': 'manual-trigger',
            'client_payload': {
                'test_suite': test_suite,
                'browser': browser,
                'environment': environment,
                'triggered_at': datetime.now().isoformat()
            }
        }

        response = requests.post(url, json=data, headers=headers)
        return response.status_code == 204

    def run_cross_browser_suite(self, test_suite):
        """Run the same test suite across all browsers"""
        browsers = ['chromium', 'firefox', 'webkit']

        for browser in browsers:
            success = self.trigger_test(test_suite, browser)
            print(f"{'✓' if success else '✗'} {test_suite} on {browser}")
            time.sleep(5)  # Avoid rate limiting

    def run_regression_suite(self):
        """Run comprehensive regression testing"""
        test_suites = ['homepage', 'navigation', 'accessibility']

        for suite in test_suites:
            self.trigger_test(suite, 'chromium')
            time.sleep(10)  # Space out the triggers

# Usage
manager = TestSuiteManager()
manager.run_cross_browser_suite('homepage')
```

## Webhook Integration with CI/CD Tools

### Jenkins Pipeline

```groovy
pipeline {
    agent any

    triggers {
        cron('H 2 * * *')  // Daily at 2 AM
    }

    stages {
        stage('Trigger Playwright Tests') {
            steps {
                script {
                    def response = httpRequest(
                        httpMode: 'POST',
                        url: "https://api.github.com/repos/${env.GITHUB_USER}/${env.GITHUB_REPO}/dispatches",
                        customHeaders: [
                            [name: 'Accept', value: 'application/vnd.github.v3+json'],
                            [name: 'Authorization', value: "token ${env.GITHUB_TOKEN}"]
                        ],
                        requestBody: '''
                        {
                            "event_type": "manual-trigger",
                            "client_payload": {
                                "test_suite": "homepage",
                                "browser": "chromium",
                                "environment": "production"
                            }
                        }
                        '''
                    )

                    if (response.status == 204) {
                        echo "Tests triggered successfully"
                    } else {
                        error "Failed to trigger tests: ${response.status}"
                    }
                }
            }
        }
    }
}
```

### GitLab CI Integration

```yaml
trigger_playwright_tests:
  stage: test
  script:
    - |
      curl -X POST \
        -H "Accept: application/vnd.github.v3+json" \
        -H "Authorization: token $GITHUB_TOKEN" \
        https://api.github.com/repos/$GITHUB_USER/$GITHUB_REPO/dispatches \
        -d '{
          "event_type": "manual-trigger",
          "client_payload": {
            "test_suite": "navigation",
            "browser": "firefox",
            "environment": "staging"
          }
        }'
  only:
    - main
    - develop
```

## Response Handling

### Check Workflow Status

```javascript
async function checkWorkflowStatus(runId) {
  const response = await axios.get(
    `https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.GITHUB_REPO}/actions/runs/${runId}`,
    {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${process.env.GITHUB_TOKEN}`
      }
    }
  );

  return response.data.status; // 'queued', 'in_progress', 'completed'
}
```

### Wait for Completion

```javascript
async function waitForTestCompletion(runId, timeout = 600000) {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const status = await checkWorkflowStatus(runId);

    if (status === 'completed') {
      const result = await getWorkflowResult(runId);
      return result.conclusion; // 'success', 'failure', 'cancelled'
    }

    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds
  }

  throw new Error('Test execution timeout');
}
```

## Best Practices

1. **Rate Limiting**: Space out webhook calls to avoid GitHub API rate limits
2. **Error Handling**: Always check response status codes
3. **Logging**: Log all webhook triggers for debugging
4. **Security**: Store GitHub tokens securely, never commit them
5. **Monitoring**: Set up alerts for failed webhook triggers
6. **Retry Logic**: Implement retry mechanisms for failed API calls

## Troubleshooting

### Common Issues

1. **403 Forbidden**: Check token permissions and repository access
2. **404 Not Found**: Verify repository URL and token validity
3. **422 Unprocessable Entity**: Check JSON payload format
4. **Rate Limited**: Implement exponential backoff

### Debug Commands

```bash
# Test token validity
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Check repository access
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/repos/USER/REPO
```