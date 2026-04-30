# AWS S3 Security Auditing Tool 🛡️

A powerful, **fully client-side** Cloud Security Posture Management (CSPM) tool designed to audit your AWS S3 buckets for common misconfigurations and security vulnerabilities.

This tool runs entirely in your local browser. Your AWS credentials are **never** sent to any external backend server; they reside only in your browser's memory and are used directly by the AWS SDK to perform read-only security checks against your infrastructure.

---

## 🌟 Key Features

*   **🔒 100% Client-Side:** No backend servers, no databases. Extreme security and privacy.
*   **🌍 Smart Auto-Discovery:** Automatically lists all your buckets across all regions. It dynamically queries `GetBucketLocationCommand` to discover each bucket's true data center and routes the security checks accordingly to avoid `PermanentRedirect` errors.
*   **🕵️ Deep Security Checks:** Analyzes 8 critical security vectors (see below).
*   **📊 Interactive Dashboard:** Visualizes your compliance posture with beautiful charts.
*   **🔀 Local CORS Bypass:** Utilizes a secure local proxy (`cors-anywhere`) to tunnel AWS SDK requests and completely bypass browser-level CORS blocking.
*   **📥 JSON Export:** Export your audit findings for compliance documentation.

---

## 🛠️ Security Checks Performed

For every bucket discovered, the engine runs the following checks:

1.  **Public Access Block:** Ensures bucket-level settings explicitly block public read/write access.
2.  **Encryption (At Rest):** Verifies that Server-Side Encryption (e.g., AES256 or KMS) is enforced by default.
3.  **Versioning:** Checks if versioning is enabled to protect against ransomware or accidental deletion.
4.  **Access Logging:** Ensures server access logging is active for forensic visibility.
5.  **MFA Delete:** Verifies if a hardware token is required to permanently delete files.
6.  **HTTPS Only Policy:** Analyzes the Bucket Policy to ensure `aws:SecureTransport` is strictly enforced.
7.  **Cross-Account Limits:** Scans the Bucket Policy for wildcards (`*`) or external principals that could lead to privilege escalation.
8.  **Lifecycle Rules:** Checks if rules are configured to transition old data to cold storage or delete it.

---

## 🚀 How to Run the Tool

Because this tool circumvents browser CORS limitations securely, it requires **two** local processes running simultaneously.

### Step 1: Start the Local Proxy Server
This acts as an invisible bridge between your browser and AWS.
1. Open a terminal.
2. Navigate to this project folder.
3. Run the following command:
   ```bash
   node proxy.js
   ```
4. *Leave this terminal running in the background.*

### Step 2: Start the Web UI Server
This serves the actual HTML/JS application.
1. Open a **second** terminal.
2. Navigate to this project folder.
3. Run the following command:
   ```bash
   python -m http.server 8000
   ```
4. *Leave this terminal running.*

### Step 3: Run the Audit
1. Open your web browser (Chrome/Edge/Firefox).
2. Go to **`http://localhost:8000`** *(Do not click the 8080 link from Step 1).*
3. Enter your AWS Access Key ID and Secret Access Key.
4. Click **Start Audit Scan** and watch the dashboard build in real-time!

---

## 🔑 Required IAM Permissions

For the tool to accurately determine your security posture, the AWS credentials you provide must belong to an IAM User or Role with the following `Read-Only` permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "S3SecurityAuditPermissions",
            "Effect": "Allow",
            "Action": [
                "s3:ListAllMyBuckets",
                "s3:GetBucketLocation",
                "s3:GetBucketPublicAccessBlock",
                "s3:GetEncryptionConfiguration",
                "s3:GetBucketVersioning",
                "s3:GetBucketLogging",
                "s3:GetBucketPolicy",
                "s3:GetLifecycleConfiguration"
            ],
            "Resource": "*"
        }
    ]
}
```
*Note: If the tool encounters an `AccessDenied` error for a specific check, it will explicitly mark that check as `FAIL` and display the API Error in the dashboard.*

---

## 🏗️ Technical Architecture
*   **Frontend:** Vanilla HTML/CSS/JS
*   **AWS SDK:** `@aws-sdk/client-s3` (v3) bundled for the browser via `esbuild`
*   **Proxy:** `cors-anywhere` (Local Node.js process)
*   **Visualization:** `Chart.js`
