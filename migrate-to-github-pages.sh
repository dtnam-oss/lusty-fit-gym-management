#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Lusty Fit - GitHub Pages Migration Script${NC}"
echo -e "${BLUE}=============================================${NC}\n"

# Create docs structure
echo -e "${GREEN}📁 Creating docs directory structure...${NC}"
mkdir -p docs/assets/{css,js,img}
mkdir -p docs/views
mkdir -p docs/modals

# Extract CSS from Stylesheet.html
echo -e "${GREEN}📝 Extracting CSS from Stylesheet.html...${NC}"
if [ -f "Stylesheet.html" ]; then
    # Remove <style> tags and save as CSS
    sed -n '/<style>/,/<\/style>/p' Stylesheet.html | \
    sed '1d;$d' > docs/assets/css/styles.css
    echo -e "${GREEN}   ✓ Created docs/assets/css/styles.css${NC}"
else
    echo -e "${YELLOW}   ⚠  Stylesheet.html not found${NC}"
fi

# Copy View files
echo -e "${GREEN}📄 Copying View files...${NC}"
cp View_*.html docs/views/ 2>/dev/null && echo -e "${GREEN}   ✓ Copied View files${NC}" || echo -e "${YELLOW}   ⚠  No View files found${NC}"

# Copy Modal files
echo -e "${GREEN}📄 Copying Modal files...${NC}"
cp Modal_*.html docs/modals/ 2>/dev/null && echo -e "${GREEN}   ✓ Copied Modal files${NC}" || echo -e "${YELLOW}   ⚠  No Modal files found${NC}"

# Copy Contract Print Templates
echo -e "${GREEN}📄 Copying Contract Templates...${NC}"
mkdir -p docs/templates
cp Contract_Print_*.html docs/templates/ 2>/dev/null && echo -e "${GREEN}   ✓ Copied templates${NC}" || echo -e "${YELLOW}   ⚠  No templates found${NC}"

# Create config.js
echo -e "${GREEN}⚙️  Creating config.js...${NC}"
cat > docs/assets/js/config.js << 'EOF'
/**
 * Configuration for GAS Backend
 *
 * IMPORTANT: Update WEB_APP_URL with your deployed GAS Web App URL
 * Get it from: Apps Script → Deploy → Manage deployments → Web app URL
 */
const GAS_CONFIG = {
  // Replace with your GAS Web App URL
  WEB_APP_URL: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID_HERE/exec',

  // API version (for future use)
  API_VERSION: 'v1',

  // Enable debug mode
  DEBUG: true
};

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAS_CONFIG;
}
EOF
echo -e "${GREEN}   ✓ Created config.js${NC}"

# Create API client
echo -e "${GREEN}🔌 Creating API client...${NC}"
cat > docs/assets/js/api-client.js << 'EOF'
/**
 * API Client for Google Apps Script Backend
 * Replaces google.script.run for deployed frontend
 */

class GASClient {
  constructor(webAppUrl, debug = false) {
    this.webAppUrl = webAppUrl;
    this.debug = debug;
    this.successHandler = null;
    this.failureHandler = null;
  }

  log(...args) {
    if (this.debug) {
      console.log('[GAS Client]', ...args);
    }
  }

  /**
   * Call GAS function
   */
  async call(functionName, ...params) {
    this.log(`Calling ${functionName} with params:`, params);

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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      this.log(`Response from ${functionName}:`, data);

      if (!data.success && data.error) {
        throw new Error(data.error);
      }

      const result = data.data;

      if (this.successHandler) {
        this.successHandler(result);
        this.successHandler = null; // Reset
      }

      return result;

    } catch (error) {
      this.log(`Error calling ${functionName}:`, error);

      if (this.failureHandler) {
        this.failureHandler(error);
        this.failureHandler = null; // Reset
      } else {
        throw error;
      }
    }
  }

  /**
   * Set success handler (chainable)
   */
  withSuccessHandler(callback) {
    this.successHandler = callback;
    return this;
  }

  /**
   * Set failure handler (chainable)
   */
  withFailureHandler(callback) {
    this.failureHandler = callback;
    return this;
  }

  /**
   * Create a proxy for dynamic function calls
   */
  createProxy() {
    return new Proxy(this, {
      get: (target, functionName) => {
        if (typeof functionName === 'string' && !functionName.startsWith('_')) {
          return (...params) => target.call(functionName, ...params);
        }
        return target[functionName];
      }
    });
  }
}

// Initialize global API client
const gasClient = new GASClient(GAS_CONFIG.WEB_APP_URL, GAS_CONFIG.DEBUG);
const gasAPI = gasClient.createProxy();

/**
 * Compatibility layer - mimics google.script.run API
 */
const google = {
  script: {
    run: new Proxy(gasClient, {
      get: (target, functionName) => {
        if (functionName === 'withSuccessHandler') {
          return (callback) => {
            target.successHandler = callback;
            return google.script.run;
          };
        }
        if (functionName === 'withFailureHandler') {
          return (callback) => {
            target.failureHandler = callback;
            return google.script.run;
          };
        }
        // Direct function call
        return (...params) => target.call(functionName, ...params);
      }
    })
  }
};

// Log ready status
console.log('✅ GAS API Client ready');
console.log('📡 Backend URL:', GAS_CONFIG.WEB_APP_URL);
EOF
echo -e "${GREEN}   ✓ Created api-client.js${NC}"

# Create main.js placeholder
echo -e "${GREEN}📜 Creating main.js...${NC}"
cat > docs/assets/js/main.js << 'EOF'
/**
 * Main application JavaScript
 * Extracted from JavaScript.html
 *
 * TODO: Copy content from JavaScript.html here
 */

console.log('🚀 Lusty Fit App Loading...');

// Application will load after copying JavaScript.html content here
EOF
echo -e "${GREEN}   ✓ Created main.js${NC}"

# Create index.html
echo -e "${GREEN}🏠 Creating index.html...${NC}"
cat > docs/index.html << 'EOF'
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lusty Fit - Gym Management System</title>

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

    <!-- Custom Styles -->
    <link rel="stylesheet" href="./assets/css/styles.css">
</head>
<body>
    <div id="toast-container"></div>
    <div id="loader" style="display:none;">Loading...</div>

    <!-- Sidebar Navigation -->
    <nav class="sidebar">
        <div class="sidebar-header">
            <button class="sidebar-toggle" onclick="toggleSidebar()" title="Thu gọn/Mở rộng menu">
                <i class="fas fa-bars"></i>
            </button>
        </div>

        <ul class="nav-links">
            <li><a id="nav-members" class="active" onclick="switchView('members')" data-tooltip="Quản lý Khách hàng">
                <i class="fas fa-users"></i>
                <span class="nav-text">Quản lý Khách hàng</span>
            </a></li>
            <li><a id="nav-pts" onclick="switchView('pts')" data-tooltip="Quản lý PT">
                <i class="fas fa-user-shield"></i>
                <span class="nav-text">Quản lý PT</span>
            </a></li>
            <li><a id="nav-contracts" onclick="switchView('contracts')" data-tooltip="Quản lý Hợp đồng">
                <i class="fas fa-file-signature"></i>
                <span class="nav-text">Quản lý Hợp đồng</span>
            </a></li>
            <li><a id="nav-receipt" onclick="switchView('receipt')" data-tooltip="Phiếu thu">
                <i class="fas fa-receipt"></i>
                <span class="nav-text">Phiếu thu</span>
            </a></li>
            <li><a id="nav-price-list" onclick="switchView('price-list')" data-tooltip="Bảng giá">
                <i class="fas fa-tags"></i>
                <span class="nav-text">Bảng giá</span>
            </a></li>
            <li><a id="nav-contract-template" onclick="switchView('contract-template')" data-tooltip="Mẫu hợp đồng">
                <i class="fas fa-file-contract"></i>
                <span class="nav-text">Mẫu hợp đồng</span>
            </a></li>
        </ul>
    </nav>

    <!-- Main Content Area -->
    <div id="view-members" class="main-content active">
        <h2>Quản lý Khách hàng</h2>
        <p>TODO: Load View_Members.html content here</p>
    </div>

    <!-- Configuration -->
    <script src="./assets/js/config.js"></script>

    <!-- API Client -->
    <script src="./assets/js/api-client.js"></script>

    <!-- Main Application -->
    <script src="./assets/js/main.js"></script>

    <script>
        // Basic toggle sidebar function
        function toggleSidebar() {
            document.body.classList.toggle('sidebar-collapsed');
            localStorage.setItem('sidebarCollapsed', document.body.classList.contains('sidebar-collapsed'));
        }

        // Basic switch view function
        function switchView(viewName) {
            document.querySelectorAll('.main-content').forEach(v => v.classList.remove('active'));
            document.querySelectorAll('.sidebar .nav-links li a').forEach(n => n.classList.remove('active'));

            const viewEl = document.getElementById(`view-${viewName}`);
            if (viewEl) viewEl.classList.add('active');

            const navEl = document.getElementById(`nav-${viewName}`);
            if (navEl) navEl.classList.add('active');
        }

        // Load saved sidebar state
        if (localStorage.getItem('sidebarCollapsed') === 'true') {
            document.body.classList.add('sidebar-collapsed');
        }

        console.log('✅ Index.html loaded');
    </script>
</body>
</html>
EOF
echo -e "${GREEN}   ✓ Created index.html${NC}"

# Create .gitignore for docs
echo -e "${GREEN}📝 Creating .gitignore...${NC}"
cat > docs/.gitignore << 'EOF'
# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/

# Logs
*.log
EOF
echo -e "${GREEN}   ✓ Created .gitignore${NC}"

# Create README for docs
echo -e "${GREEN}📖 Creating README.md for docs...${NC}"
cat > docs/README.md << 'EOF'
# Lusty Fit - Web Application

This is the frontend for Lusty Fit Gym Management System, deployed on GitHub Pages.

## Setup

1. Update `assets/js/config.js` with your GAS Web App URL
2. Deploy to GitHub Pages from repository settings

## Local Development

```bash
# Serve locally
python3 -m http.server 8000

# Or use Live Server extension in VS Code
```

## Links

- Backend: Google Apps Script
- Frontend: GitHub Pages
- Repository: https://github.com/dtnam-oss/lusty-fit-gym-management
EOF
echo -e "${GREEN}   ✓ Created README.md${NC}"

echo -e "\n${BLUE}=============================================${NC}"
echo -e "${GREEN}✅ Migration Complete!${NC}\n"

echo -e "${YELLOW}📋 Next Steps:${NC}"
echo -e "1. Update ${BLUE}docs/assets/js/config.js${NC} with your GAS Web App URL"
echo -e "2. Copy JavaScript.html content to ${BLUE}docs/assets/js/main.js${NC}"
echo -e "3. Test locally: ${BLUE}cd docs && python3 -m http.server 8000${NC}"
echo -e "4. Commit and push:"
echo -e "   ${BLUE}git add docs/${NC}"
echo -e "   ${BLUE}git commit -m 'feat: Add GitHub Pages deployment'${NC}"
echo -e "   ${BLUE}git push origin main${NC}"
echo -e "5. Enable GitHub Pages in repository settings"
echo -e "   Settings → Pages → Source: main branch → /docs folder\n"

echo -e "${GREEN}📚 Documentation: ${BLUE}HYBRID_DEPLOYMENT_GUIDE.md${NC}\n"
EOF
echo -e "${GREEN}   ✓ Created migration script${NC}"

# Make script executable
chmod +x migrate-to-github-pages.sh
echo -e "${GREEN}   ✓ Made script executable${NC}"

echo -e "\n${BLUE}=============================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}\n"

echo -e "${YELLOW}📋 What was created:${NC}"
echo -e "- ${BLUE}migrate-to-github-pages.sh${NC} - Migration script"
echo -e "- ${BLUE}HYBRID_DEPLOYMENT_GUIDE.md${NC} - Deployment guide"
echo -e "- ${BLUE}backend/${NC} - Node.js backend (for future full migration)"
echo -e "- ${BLUE}MIGRATION_TO_STANDALONE.md${NC} - Full migration guide\n"

echo -e "${YELLOW}🚀 To start Hybrid Deployment:${NC}"
echo -e "Run: ${BLUE}./migrate-to-github-pages.sh${NC}\n"
