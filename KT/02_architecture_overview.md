# Module 2: Architecture Overview

## 🏗️ The Three Pillars
The project is built on three main pillars that work together to provide a seamless auditing experience.

### 1. The Web UI (Browser)
*   **Files:** `index.html`, `css/style.css`, `js/bundle.js`
*   **Responsibility:** Providing the login form, the scanning progress bar, and the final dashboard with charts.
*   **Logic:** Orchestrates the scan, holds the credentials in memory, and renders findings.

### 2. The Local Proxy (Node.js)
*   **Files:** `proxy.js`
*   **Responsibility:** Acts as an "invisible bridge." It takes requests from the browser, strips away the CORS headers that cause browser errors, and forwards the requests to AWS.
*   **Why?** Browsers block direct `fetch()` calls to AWS S3 Global endpoints. The proxy "tricks" the browser into thinking it's talking to a friendly local server.

### 3. The AWS SDK (Bundled JS)
*   **Files:** `js/aws-config.js`, `js/scanner.js`
*   **Responsibility:** The actual "brain" of the operation. It knows how to speak the AWS S3 language (XML/JSON over HTTPS) and how to sign requests with your keys.

## 🔄 High-Level Data Flow

1.  **Input:** User enters `AccessKey` and `SecretKey` in `index.html`.
2.  **Initialization:** `main.js` calls `initializeAWS()`, which sets up the base `S3Client`.
3.  **Discovery:** `main.js` calls `ListBuckets`. This request is intercepted by our custom code and routed through `localhost:8080` (the proxy).
4.  **Regional Routing:** For every bucket found:
    *   The tool asks AWS for the bucket's region.
    *   A new client is created specifically for that region.
5.  **Auditing:** `scanner.js` runs 8 different security commands against the bucket.
6.  **Reporting:** `reporter.js` takes the final list of results, calculates totals, and draws a chart.

## 🛡️ Security Design
A critical feature of this architecture is that it is **Stateless**.
*   We do not store your keys in `localStorage` or cookies. 
*   If you refresh the page, the keys are gone. 
*   This protects you from "XSS" attacks where a malicious script could steal saved keys.

---
**Next Up:** [Module 3: The Proxy & CORS Bypass](03_the_proxy_and_cors.md)
