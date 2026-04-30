# AWS_S3_scanner
Here's the **complete project details** for building the S3 Bucket Audit Tool as a web app (HTML/CSS/JS):

---

## 🗂️ Project Overview

A browser-based security dashboard where you input your AWS credentials, it scans your S3 buckets via AWS SDK, and displays a visual security report — no CLI, no backend needed.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| UI | HTML + CSS |
| Logic | Vanilla JavaScript |
| AWS Connection | AWS SDK for JavaScript (v3) |
| Charts/Visuals | Chart.js |
| Styling Extras | Google Fonts + CSS animations |

No frameworks needed. Runs entirely in the browser.

---

## 📁 File Structure

```
s3-audit-tool/
│
├── index.html           → Main page (credentials form + dashboard layout)
├── css/
│   ├── style.css        → Layout, colors, typography
│   └── report.css       → Report cards, badges, status colors
│
├── js/
│   ├── aws-config.js    → AWS SDK setup & credential handling
│   ├── scanner.js       → All S3 audit check functions
│   ├── reporter.js      → Builds HTML report from scan results
│   └── main.js          → Ties everything together, handles UI events
│
├── assets/
│   └── icons/           → Lock, shield, warning SVG icons
│
└── README.md
```

---

## 📄 Page Breakdown

### Page 1 — Credentials Screen (`index.html`)
- Input fields for: AWS Access Key, Secret Key, Region selector
- "Start Audit" button
- Warning note about credentials never leaving the browser
- Clean centered card layout

### Page 2 — Scanning Screen
- Animated progress bar
- Live log feed showing which bucket is being scanned
- "Scanning bucket 3 of 7…" status text

### Page 3 — Report Dashboard
- Summary bar at top: Total buckets / Passed / Failed / Warnings
- Doughnut chart showing pass vs fail ratio
- One card per bucket with expandable check results
- Color-coded badges: ✅ PASS / ❌ FAIL / ⚠️ WARN
- Export to JSON button

---

## 🔍 Security Checks (JavaScript Functions)

```
scanner.js contains these functions:

checkPublicAccess(bucket)     → calls getPublicAccessBlock API
checkEncryption(bucket)       → calls getBucketEncryption API
checkVersioning(bucket)       → calls getBucketVersioning API
checkLogging(bucket)          → calls getBucketLogging API
checkMFADelete(bucket)        → reads versioning config MFA field
checkHTTPSPolicy(bucket)      → parses bucket policy for aws:SecureTransport
checkLifecycle(bucket)        → calls getBucketLifecycleConfiguration API
checkCrossAccountAccess(bucket) → parses bucket policy for external principals
```

Each function returns:
```js
{
  name: "Encryption",
  status: "FAIL",           // PASS / FAIL / WARN
  detail: "No SSE configured",
  severity: "HIGH"          // HIGH / MEDIUM / LOW
}
```

---

## 🎨 UI Sections Detail

### Header
- Shield logo + "S3 Audit Tool" title
- AWS region badge showing connected region
- Disconnect / Re-scan buttons

### Summary Cards (top row)
```
[ 🪣 Total Buckets: 6 ]  [ ✅ Passed: 12 ]  [ ❌ Failed: 7 ]  [ ⚠️ Warnings: 3 ]
```

### Bucket Cards (main area)
Each bucket gets a card showing:
```
📦 my-app-assets                          [RISK: HIGH 🔴]
─────────────────────────────────────────────────────────
✅ Public Access Block     PASS
❌ Encryption              FAIL   — No SSE configured
❌ Versioning              FAIL   — Disabled
✅ Access Logging          PASS
⚠️  MFA Delete             WARN   — Not enforced
✅ HTTPS Only Policy       PASS
❌ Lifecycle Policy        FAIL   — Not configured
─────────────────────────────────────────────────────────
[▼ View Raw API Response]
```

### Chart Section
- Doughnut chart: overall pass/fail ratio
- Bar chart: failures per bucket (which bucket is most risky)

---

## 🔐 IAM Policy to Create in AWS

Before running the tool, create a read-only IAM user in AWS Console with this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:ListAllMyBuckets",
        "s3:GetBucketAcl",
        "s3:GetBucketPolicy",
        "s3:GetBucketEncryption",
        "s3:GetBucketVersioning",
        "s3:GetBucketLogging",
        "s3:GetBucketPublicAccessBlock",
        "s3:GetBucketLifecycleConfiguration"
      ],
      "Resource": "*"
    }
  ]
}
```

Generate Access Key + Secret Key from that user and paste into the tool.

---

## 🏗️ Build Milestones

**Week 1 — HTML/CSS Layout**
- Build all 3 pages (credentials, scanning, report) as static HTML
- Style with CSS: cards, badges, color system, fonts
- Make it responsive

**Week 2 — AWS SDK Integration**
- Load AWS SDK v3 via CDN
- Connect credentials and list buckets
- Run 3 basic checks (public access, encryption, versioning)

**Week 3 — All Checks + Report Builder**
- Add remaining 5 checks
- Build `reporter.js` to dynamically render bucket cards from scan data
- Add Chart.js doughnut + bar charts

**Week 4 — Polish**
- Animated progress bar during scan
- Live log feed
- JSON export button
- Error handling (wrong credentials, no buckets, permission denied)
- Loading skeletons for each card

---

## 📦 CDN Links to Use (no npm needed)

```html
<!-- AWS SDK v3 (S3 client) -->
<script src="https://cdn.jsdelivr.net/npm/@aws-sdk/client-s3/dist/cjs/index.js"></script>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Google Fonts -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono&family=Syne:wght@700&display=swap" rel="stylesheet">
```

---

## 🎓 What You'll Learn From This Project

**AWS Skills**
- How S3 bucket policies and ACLs work
- What encryption types exist (SSE-S3, SSE-KMS, SSE-C)
- How IAM least-privilege access is applied
- Real CIS AWS Benchmark checks

**JavaScript Skills**
- Working with async/await and Promises
- Consuming AWS SDK APIs in the browser
- Dynamic DOM manipulation (building cards from data)
- JSON parsing and data transformation

**Security Concepts**
- Why public buckets are dangerous (real breaches: Capital One, GoDaddy)
- Defense in depth (multiple overlapping checks)
- Risk scoring and severity classification
- Compliance frameworks (CIS, SOC2, GDPR relevance)

---

## ⚠️ Security Note for the Tool Itself

Since this runs in a browser, never host it on a public server with credentials stored. Best practice: run it locally by opening `index.html` directly in your browser — credentials stay in memory only and are never sent anywhere except AWS APIs directly.

---

