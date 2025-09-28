# 🎯 PMI Lakeshore Test Trigger Links

**Repository**: https://github.com/leelakrishnasarepalli/runloctests

## 🔑 Quick Setup

1. **Create GitHub Personal Access Token**:
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scope: `repo` (Full control of private repositories)
   - Copy and save your token securely

2. **Replace `YOUR_GITHUB_TOKEN` in the commands below with your actual token**

## 🚀 Ready-to-Use Trigger Commands

### 1. 🎭 Run PMI Event Navigation Tests
```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/leelakrishnasarepalli/runloctests/dispatches \
  -d '{
    "event_type": "manual-trigger",
    "client_payload": {
      "test_suite": "event-navigation",
      "browser": "chromium",
      "environment": "production"
    }
  }'
```

### 2. 🖼️ Run Banner Image Navigation Tests
```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/leelakrishnasarepalli/runloctests/dispatches \
  -d '{
    "event_type": "manual-trigger",
    "client_payload": {
      "test_suite": "banner-navigation",
      "browser": "chromium",
      "environment": "production"
    }
  }'
```

### 3. 🏠 Run Homepage Tests
```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/leelakrishnasarepalli/runloctests/dispatches \
  -d '{
    "event_type": "manual-trigger",
    "client_payload": {
      "test_suite": "homepage",
      "browser": "chromium",
      "environment": "production"
    }
  }'
```

### 4. 🧭 Run Navigation Tests
```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/leelakrishnasarepalli/runloctests/dispatches \
  -d '{
    "event_type": "manual-trigger",
    "client_payload": {
      "test_suite": "navigation",
      "browser": "chromium",
      "environment": "production"
    }
  }'
```

### 5. ♿ Run Accessibility Tests
```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/leelakrishnasarepalli/runloctests/dispatches \
  -d '{
    "event_type": "manual-trigger",
    "client_payload": {
      "test_suite": "accessibility",
      "browser": "chromium",
      "environment": "production"
    }
  }'
```

### 6. 🎯 Run ALL Tests
```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/leelakrishnasarepalli/runloctests/dispatches \
  -d '{
    "event_type": "manual-trigger",
    "client_payload": {
      "test_suite": "all",
      "browser": "chromium",
      "environment": "production"
    }
  }'
```

## 🌐 Browser-Specific Triggers

### Firefox Testing
```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/leelakrishnasarepalli/runloctests/dispatches \
  -d '{
    "event_type": "manual-trigger",
    "client_payload": {
      "test_suite": "event-navigation",
      "browser": "firefox",
      "environment": "production"
    }
  }'
```

### Safari/WebKit Testing
```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/leelakrishnasarepalli/runloctests/dispatches \
  -d '{
    "event_type": "manual-trigger",
    "client_payload": {
      "test_suite": "homepage",
      "browser": "webkit",
      "environment": "production"
    }
  }'
```

## 🛠️ Postman Collection

Import this into Postman for easy testing:

```json
{
  "info": {
    "name": "PMI Lakeshore Test Triggers",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Trigger Event Navigation Tests",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Accept",
            "value": "application/vnd.github.v3+json"
          },
          {
            "key": "Authorization",
            "value": "token {{GITHUB_TOKEN}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\\n  \\"event_type\\": \\"manual-trigger\\",\\n  \\"client_payload\\": {\\n    \\"test_suite\\": \\"event-navigation\\",\\n    \\"browser\\": \\"chromium\\",\\n    \\"environment\\": \\"production\\"\\n  }\\n}",
          "options": {
            "raw": {
              "language": "json"
            }
          }
        },
        "url": {
          "raw": "https://api.github.com/repos/leelakrishnasarepalli/runloctests/dispatches",
          "protocol": "https",
          "host": ["api", "github", "com"],
          "path": ["repos", "leelakrishnasarepalli", "runloctests", "dispatches"]
        }
      }
    }
  ]
}
```

## 🖱️ One-Click Web Interface

Create an HTML file with buttons to trigger tests:

```html
<!DOCTYPE html>
<html>
<head>
    <title>PMI Lakeshore Test Triggers</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        .button {
            background: #007bff;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            margin: 10px;
            cursor: pointer;
        }
        .button:hover { background: #0056b3; }
        .token-input {
            width: 400px;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ccc;
            border-radius: 5px;
        }
    </style>
</head>
<body>
    <h1>🎭 PMI Lakeshore Test Triggers</h1>

    <div>
        <label>GitHub Token:</label><br>
        <input type="password" id="token" class="token-input" placeholder="Paste your GitHub token here">
    </div>

    <div>
        <button class="button" onclick="triggerTest('event-navigation')">🎭 Event Navigation</button>
        <button class="button" onclick="triggerTest('banner-navigation')">🖼️ Banner Navigation</button>
        <button class="button" onclick="triggerTest('homepage')">🏠 Homepage Tests</button>
        <button class="button" onclick="triggerTest('navigation')">🧭 Navigation Tests</button>
        <button class="button" onclick="triggerTest('accessibility')">♿ Accessibility</button>
        <button class="button" onclick="triggerTest('all')">🎯 All Tests</button>
    </div>

    <div id="status"></div>

    <script>
        async function triggerTest(testSuite) {
            const token = document.getElementById('token').value;
            if (!token) {
                alert('Please enter your GitHub token first');
                return;
            }

            const status = document.getElementById('status');
            status.innerHTML = `Triggering ${testSuite} tests...`;

            try {
                const response = await fetch('https://api.github.com/repos/leelakrishnasarepalli/runloctests/dispatches', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/vnd.github.v3+json',
                        'Authorization': `token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        event_type: 'manual-trigger',
                        client_payload: {
                            test_suite: testSuite,
                            browser: 'chromium',
                            environment: 'production'
                        }
                    })
                });

                if (response.status === 204) {
                    status.innerHTML = `✅ ${testSuite} tests triggered successfully! Check GitHub Actions for progress.`;
                } else {
                    status.innerHTML = `❌ Failed to trigger tests: ${response.status}`;
                }
            } catch (error) {
                status.innerHTML = `❌ Error: ${error.message}`;
            }
        }
    </script>
</body>
</html>
```

## 📊 Monitor Test Results

After triggering tests, monitor progress at:
- **GitHub Actions**: https://github.com/leelakrishnasarepalli/runloctests/actions
- **Test Reports**: Available as workflow artifacts after completion

## 🔧 Custom Environment Testing

To test against a different URL:

```bash
curl -X POST \
  -H "Accept: application/vnd.github.v3+json" \
  -H "Authorization: token YOUR_GITHUB_TOKEN" \
  https://api.github.com/repos/leelakrishnasarepalli/runloctests/dispatches \
  -d '{
    "event_type": "manual-trigger",
    "client_payload": {
      "test_suite": "homepage",
      "browser": "chromium",
      "environment": "staging",
      "base_url": "https://staging.pmiloc.org"
    }
  }'
```

## 🚨 Important Notes

1. **Rate Limits**: GitHub API allows 5,000 requests per hour
2. **Response**: Successful trigger returns HTTP 204 (No Content)
3. **Execution Time**: Tests typically take 3-10 minutes to complete
4. **Artifacts**: Test reports are saved for 90 days
5. **Costs**: Completely free within GitHub Actions limits

## 🎯 Next Steps

1. Get your GitHub token from: https://github.com/settings/tokens
2. Replace `YOUR_GITHUB_TOKEN` in any command above
3. Run the command in terminal or use the web interface
4. Monitor results at: https://github.com/leelakrishnasarepalli/runloctests/actions

**Happy Testing! 🎭**