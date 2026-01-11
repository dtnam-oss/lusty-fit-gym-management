# Hybrid Deployment Guide: GAS Backend + GitHub Pages Frontend

## 🎯 Goal
Deploy frontend lên GitHub Pages, giữ nguyên backend Google Apps Script

## ✅ Advantages
- ✅ Không cần thay đổi backend (Google Sheets + GAS)
- ✅ Frontend deploy tự động từ GitHub
- ✅ Custom domain support (GitHub Pages)
- ✅ CDN global (GitHub Pages)
- ✅ HTTPS miễn phí
- ✅ Không mất data migration time
- ✅ Zero cost

## 📋 Step-by-Step Guide

### Step 1: Update GAS để cho phép CORS

Thêm vào đầu file `Code.js`:

```javascript
function doGet(e) {
  // Enable CORS
  var output = HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Lusty Fit CRM')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');

  return output;
}

// Add CORS headers for API endpoints
function doPost(e) {
  return ContentService
    .createTextOutput(JSON.stringify({success: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
```

Deploy lại GAS web app và lấy URL.

### Step 2: Tạo Frontend cho GitHub Pages

#### 2.1 Copy files vào thư mục `docs/`

GitHub Pages có thể serve từ thư mục `docs/` trong main branch.

```bash
# Tạo thư mục docs
mkdir -p docs/assets/{css,js}

# Copy và refactor files
# (Tôi sẽ làm automated script)
```

#### 2.2 File structure mới:

```
docs/                          # GitHub Pages root
├── index.html                # Main page
├── assets/
│   ├── css/
│   │   └── styles.css       # From Stylesheet.html
│   ├── js/
│   │   ├── config.js        # GAS API URL config
│   │   ├── api-client.js    # Wrapper for google.script.run
│   │   └── main.js          # From JavaScript.html
│   └── img/
│       └── logo.png
├── views/                    # HTML views (optional separate)
└── README.md                # Docs homepage
```

### Step 3: Create API Client

Tạo file `docs/assets/js/config.js`:

```javascript
// GAS Web App URL
const GAS_CONFIG = {
  WEB_APP_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec',
  API_VERSION: 'v1'
};
```

Tạo file `docs/assets/js/api-client.js`:

```javascript
/**
 * API Client - Wrapper for GAS calls
 * Replaces google.script.run for deployed frontend
 */
class GASClient {
  constructor(webAppUrl) {
    this.webAppUrl = webAppUrl;
  }

  async call(functionName, params = {}) {
    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          function: functionName,
          parameters: params
        }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('GAS API Error:', error);
      throw error;
    }
  }

  // Wrapper methods that mimic google.script.run
  withSuccessHandler(callback) {
    this.successHandler = callback;
    return this;
  }

  withFailureHandler(callback) {
    this.failureHandler = callback;
    return this;
  }

  async execute(functionName, ...params) {
    try {
      const result = await this.call(functionName, params);
      if (this.successHandler) {
        this.successHandler(result);
      }
      return result;
    } catch (error) {
      if (this.failureHandler) {
        this.failureHandler(error);
      }
      throw error;
    }
  }
}

// Initialize global API client
const gasClient = new GASClient(GAS_CONFIG.WEB_APP_URL);

// Compatibility layer - make it work like google.script.run
const google = {
  script: {
    run: {
      withSuccessHandler: (callback) => {
        gasClient.successHandler = callback;
        return gasClient;
      },
      withFailureHandler: (callback) => {
        gasClient.failureHandler = callback;
        return gasClient;
      }
    }
  }
};

// Export for modules
export { gasClient, google };
```

### Step 4: Update Code.js trong GAS

Thêm endpoint handler:

```javascript
/**
 * Handle POST requests from deployed frontend
 */
function doPost(e) {
  try {
    const requestData = JSON.parse(e.postData.contents);
    const functionName = requestData.function;
    const params = requestData.parameters || [];

    // Security: whitelist allowed functions
    const allowedFunctions = [
      'getMembers', 'addMember', 'updateMember', 'deleteMember',
      'getContracts', 'addContract', 'updateContract', 'deleteContract',
      'getContractTemplates', 'addContractTemplate', 'updateContractTemplate',
      'getPTs', 'getReceipts', 'getPriceList', 'getSettings',
      // ... add all your public functions
    ];

    if (!allowedFunctions.includes(functionName)) {
      throw new Error('Function not allowed');
    }

    // Execute function dynamically
    const result = this[functionName].apply(this, params);

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        data: result
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 5: Enable GitHub Pages

1. **Push `docs/` folder to GitHub**:
```bash
git add docs/
git commit -m "feat: Add GitHub Pages frontend"
git push origin main
```

2. **Enable GitHub Pages**:
   - Go to: Repository → Settings → Pages
   - Source: Deploy from branch
   - Branch: `main`
   - Folder: `/docs`
   - Click Save

3. **Wait 1-2 minutes** for deployment

4. **Access your site**:
   - URL: `https://username.github.io/repository-name/`
   - Example: `https://dtnam-oss.github.io/lusty-fit-gym-management/`

### Step 6: Custom Domain (Optional)

1. Add file `docs/CNAME`:
```
your-custom-domain.com
```

2. Configure DNS:
```
Type: A
Name: @
Value: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153

Type: CNAME
Name: www
Value: username.github.io
```

## 🔧 Quick Setup Script

Tôi sẽ tạo script tự động migrate:

```bash
#!/bin/bash
# migrate-to-github-pages.sh

echo "🚀 Migrating to GitHub Pages..."

# Create docs structure
mkdir -p docs/assets/{css,js}

# Extract CSS
echo "📝 Extracting CSS..."
sed -n '/<style>/,/<\/style>/p' Stylesheet.html > docs/assets/css/styles.css

# Copy Views and Modals
echo "📁 Copying HTML files..."
cp View_*.html docs/
cp Modal_*.html docs/

# Create config
echo "⚙️  Creating config..."
cat > docs/assets/js/config.js << 'EOF'
const GAS_CONFIG = {
  WEB_APP_URL: 'REPLACE_WITH_YOUR_GAS_URL',
  API_VERSION: 'v1'
};
EOF

echo "✅ Migration complete!"
echo "📋 Next steps:"
echo "1. Update GAS_CONFIG.WEB_APP_URL in docs/assets/js/config.js"
echo "2. git add docs/"
echo "3. git commit -m 'Add GitHub Pages frontend'"
echo "4. git push origin main"
echo "5. Enable GitHub Pages in repository settings"
```

## 🎯 Testing

1. **Local testing**:
```bash
cd docs
python3 -m http.server 8000
# Open http://localhost:8000
```

2. **Test API calls**:
   - Open browser console
   - Check network tab for POST requests to GAS
   - Verify CORS headers

## 📊 Architecture Diagram

```
User Browser
     ↓
https://yourusername.github.io/repo-name/
     │
     ├─ Static Assets (HTML/CSS/JS) from GitHub Pages
     │
     └─ API Calls (POST) ───→ GAS Web App URL
                              │
                              ├─ Code.js (doPost handler)
                              │
                              └─ Controllers → Google Sheets
```

## ⚠️ Important Notes

1. **CORS**: GAS must allow requests from GitHub Pages domain
2. **Security**: Use function whitelist in doPost
3. **Rate Limits**: GAS has quota limits (script executions/day)
4. **Session**: No session/cookies between GitHub Pages and GAS
5. **Authentication**: Consider adding simple token-based auth

## 🚀 Advantages vs Full Migration

| Aspect | Hybrid (This) | Full Migration |
|--------|--------------|----------------|
| Backend Changes | None | Complete rewrite |
| Data Migration | None | Required |
| Cost | $0 | $0 (free tiers) |
| Time to Deploy | 1-2 hours | 2-4 weeks |
| Complexity | Low | High |
| Risk | Very Low | Medium |
| Custom Domain | ✅ Yes | ✅ Yes |
| Performance | Good | Better |

## 📚 Next Steps

Sau khi hybrid deployment xong, bạn có thể:
1. Add authentication layer
2. Add caching (localStorage)
3. Progressive Web App (PWA)
4. Migrate từng phần backend nếu cần scale

---

**Ready to start?** Tôi sẽ tạo automated script để migrate!
