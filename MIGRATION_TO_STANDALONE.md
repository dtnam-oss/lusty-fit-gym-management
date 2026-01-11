# Migration: Google Apps Script → Standalone Web App

## 📋 Overview

Dự án được migration từ Google Apps Script sang standalone web application với:
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: Vanilla HTML/CSS/JS (tái sử dụng code hiện tại)
- **Deployment**:
  - Backend: Vercel/Railway/Render (free tier)
  - Frontend: GitHub Pages
  - Database: MongoDB Atlas (free tier)

## 🏗️ New Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Frontend (GitHub Pages)                                │ │
│  │  - index.html                                          │ │
│  │  - View_*.html                                         │ │
│  │  - Modal_*.html                                        │ │
│  │  - JavaScript (refactored to call REST API)           │ │
│  │  - Stylesheet                                          │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ REST API (HTTPS)
┌─────────────────────────────────────────────────────────────┐
│              BACKEND SERVER (Vercel/Railway)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Express.js REST API                                   │ │
│  │  ├── Routes                                            │ │
│  │  │   ├── /api/v1/members                              │ │
│  │  │   ├── /api/v1/contracts                            │ │
│  │  │   ├── /api/v1/contract-templates                   │ │
│  │  │   ├── /api/v1/receipts                             │ │
│  │  │   └── ...                                          │ │
│  │  ├── Controllers (Business logic)                     │ │
│  │  ├── Models (Mongoose schemas)                        │ │
│  │  ├── Middleware (Auth, validation)                    │ │
│  │  └── Utils                                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            ↓ MongoDB Driver
┌─────────────────────────────────────────────────────────────┐
│                 DATABASE (MongoDB Atlas)                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Collections:                                          │ │
│  │  ├── members (khach_hang)                             │ │
│  │  ├── contracts (hop_dong)                             │ │
│  │  ├── contract_templates (mau_hop_dong)                │ │
│  │  ├── receipts (phieu_thu)                             │ │
│  │  ├── pts (personal trainers)                          │ │
│  │  ├── price_lists (bang_gia)                           │ │
│  │  ├── policy_members (chinh_sach_hoi_vien)             │ │
│  │  ├── policy_pts (chinh_sach_pt)                       │ │
│  │  ├── programs (chuong_trinh)                          │ │
│  │  ├── gifts (qua_tang)                                 │ │
│  │  └── settings (cau_hinh)                              │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 📁 New Project Structure

```
lusty_fit/
├── backend/                          # Node.js + Express API
│   ├── config/
│   │   ├── database.js              # MongoDB connection
│   │   └── constants.js             # App constants
│   ├── models/                      # Mongoose schemas
│   │   ├── Member.js
│   │   ├── Contract.js
│   │   ├── ContractTemplate.js
│   │   ├── PT.js
│   │   ├── Receipt.js
│   │   ├── PriceList.js
│   │   ├── PolicyMember.js
│   │   ├── PolicyPT.js
│   │   ├── Program.js
│   │   ├── Gift.js
│   │   └── Setting.js
│   ├── controllers/                 # Business logic
│   │   ├── memberController.js
│   │   ├── contractController.js
│   │   ├── contractTemplateController.js
│   │   ├── ptController.js
│   │   ├── receiptController.js
│   │   ├── priceListController.js
│   │   ├── policyController.js
│   │   ├── programController.js
│   │   ├── giftController.js
│   │   └── settingsController.js
│   ├── routes/                      # API routes
│   │   ├── memberRoutes.js
│   │   ├── contractRoutes.js
│   │   ├── contractTemplateRoutes.js
│   │   ├── ptRoutes.js
│   │   ├── receiptRoutes.js
│   │   ├── priceListRoutes.js
│   │   ├── policyRoutes.js
│   │   ├── programRoutes.js
│   │   ├── giftRoutes.js
│   │   └── settingsRoutes.js
│   ├── middleware/
│   │   ├── auth.js                  # Authentication
│   │   ├── errorHandler.js          # Error handling
│   │   └── validator.js             # Input validation
│   ├── utils/
│   │   ├── pointsCalculator.js      # Points calculation
│   │   └── helpers.js               # Helper functions
│   ├── server.js                    # Entry point
│   ├── package.json
│   ├── .env.example
│   └── vercel.json                  # Vercel deployment config
│
├── frontend/                         # Static site for GitHub Pages
│   ├── index.html                   # Main entry (refactored)
│   ├── views/
│   │   ├── View_Members.html
│   │   ├── View_Contracts.html
│   │   ├── View_ContractTemplate.html
│   │   ├── View_PT.html
│   │   └── ...
│   ├── modals/
│   │   ├── Modal_Member.html
│   │   ├── Modal_Contract.html
│   │   ├── Modal_ContractTemplate.html
│   │   └── ...
│   ├── assets/
│   │   ├── css/
│   │   │   └── styles.css           # Refactored from Stylesheet.html
│   │   ├── js/
│   │   │   ├── api.js               # API client (replaces google.script.run)
│   │   │   ├── main.js              # Refactored from JavaScript.html
│   │   │   ├── members.js
│   │   │   ├── contracts.js
│   │   │   ├── contractTemplates.js
│   │   │   └── ...
│   │   └── templates/
│   │       ├── Contract_Print_Template.html
│   │       └── Contract_Print_PT_Template.html
│   └── README.md
│
├── docs/                            # Documentation (existing)
│   ├── FEATURE_*.md
│   ├── CHANGELOG_*.md
│   ├── SCHEMA_*.md
│   └── MIGRATION_TO_STANDALONE.md   # This file
│
├── .gitignore
├── README.md                        # Updated README
└── package.json                     # Root package.json (optional)
```

## 🔄 Migration Steps

### Phase 1: Backend Setup (Week 1)

#### 1.1 Database Setup
```bash
# Create MongoDB Atlas account (free tier)
# Create cluster
# Get connection string
# Update backend/.env file
```

#### 1.2 Install Backend Dependencies
```bash
cd backend
npm install
```

#### 1.3 Create Models
- Convert Google Sheets schema to Mongoose schemas
- Add validation and methods
- Create indexes for performance

#### 1.4 Create Controllers
- Refactor `*Controller.js` from GAS to Express controllers
- Convert `google.script.run` calls to REST endpoints
- Add error handling

#### 1.5 Create Routes
- Define REST API endpoints
- Add middleware (auth, validation)

#### 1.6 Test Backend Locally
```bash
npm run dev
# Test endpoints with Postman/Insomnia
```

### Phase 2: Frontend Refactoring (Week 2)

#### 2.1 Extract CSS
- Move from `Stylesheet.html` to `frontend/assets/css/styles.css`

#### 2.2 Extract JavaScript
- Split `JavaScript.html` into modules
- Create API client to replace `google.script.run`
- Update all function calls

#### 2.3 Update HTML Files
- Change includes to static imports
- Update API calls
- Add loading states and error handling

#### 2.4 Test Frontend Locally
```bash
# Use Live Server or http-server
npx http-server frontend -p 3000
```

### Phase 3: Data Migration (Week 3)

#### 3.1 Export from Google Sheets
```javascript
// Script to export data to JSON
function exportAllData() {
  const sheets = ['khach_hang', 'hop_dong', 'mau_hop_dong', ...];
  const data = {};

  sheets.forEach(sheetName => {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    const values = sheet.getDataRange().getValues();
    data[sheetName] = convertToJSON(values);
  });

  // Save to Drive
  DriveApp.createFile('data_export.json', JSON.stringify(data, null, 2));
}
```

#### 3.2 Import to MongoDB
```javascript
// backend/scripts/import-data.js
import fs from 'fs';
import mongoose from 'mongoose';
import Member from './models/Member.js';
import Contract from './models/Contract.js';
// ... import other models

const importData = async () => {
  const data = JSON.parse(fs.readFileSync('./data_export.json', 'utf-8'));

  // Import members
  await Member.insertMany(data.khach_hang);

  // Import contracts
  await Contract.insertMany(data.hop_dong);

  // ... import other collections
};

importData();
```

### Phase 4: Deployment (Week 4)

#### 4.1 Deploy Backend to Vercel

**Create `backend/vercel.json`:**
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "JWT_SECRET": "@jwt-secret"
  }
}
```

**Deploy:**
```bash
cd backend
npm install -g vercel
vercel login
vercel --prod
```

#### 4.2 Deploy Frontend to GitHub Pages

**Create `.github/workflows/deploy.yml`:**
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend
          publish_branch: gh-pages
```

**Or manual deployment:**
```bash
# Enable GitHub Pages in repo settings
# Select 'gh-pages' branch as source
git subtree push --prefix frontend origin gh-pages
```

## 🔧 Key Changes

### API Client (replaces `google.script.run`)

**Old (GAS):**
```javascript
google.script.run
  .withSuccessHandler(data => {
    allMembers = data;
    displayMembers();
  })
  .withFailureHandler(error => {
    showToast('Error: ' + error.message, 'error');
  })
  .getMembers();
```

**New (REST API):**
```javascript
// frontend/assets/js/api.js
const API_BASE_URL = 'https://your-backend.vercel.app/api/v1';

const api = {
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },

  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return response.json();
  },

  // ... put, delete methods
};

// Usage
async function getMembers() {
  try {
    const data = await api.get('/members');
    allMembers = data.members;
    displayMembers();
  } catch (error) {
    showToast('Error: ' + error.message, 'error');
  }
}
```

## 💰 Cost Breakdown (Free Tier)

| Service | Tier | Limits | Cost |
|---------|------|--------|------|
| **MongoDB Atlas** | Free | 512MB storage, Shared cluster | $0 |
| **Vercel** | Hobby | 100GB bandwidth/month, Serverless | $0 |
| **GitHub Pages** | Free | 1GB storage, 100GB bandwidth/month | $0 |
| **Total** | | | **$0/month** |

## 🚀 Advantages of New Architecture

1. **Independence**: Không phụ thuộc vào Google Apps Script
2. **Scalability**: Dễ scale horizontal/vertical
3. **Performance**: Faster response times
4. **Modern Stack**: Use latest Node.js/MongoDB features
5. **DevOps**: CI/CD, automated testing, monitoring
6. **API-First**: Có thể build mobile app sau này
7. **Free Hosting**: Hoàn toàn miễn phí với free tiers

## ⚠️ Considerations

1. **Learning Curve**: Cần học MongoDB, Express, REST API
2. **Migration Time**: ~3-4 weeks for full migration
3. **Data Migration**: Cần script để chuyển data từ Sheets
4. **Testing**: Phải test kỹ trước khi production
5. **Monitoring**: Setup error tracking (Sentry free tier)

## 📚 Resources

- [Express.js Docs](https://expressjs.com/)
- [Mongoose Docs](https://mongoosejs.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Pages](https://pages.github.com/)

## 🎯 Next Steps

1. **Review this migration plan**
2. **Setup MongoDB Atlas account**
3. **Start with Phase 1: Backend Setup**
4. **Test locally before deploying**
5. **Deploy to staging environment first**
6. **Full migration after testing**

---

**Note**: Backup toàn bộ data từ Google Sheets trước khi migration!
