# Module 8: Maintenance & Extensions

## 🔧 How to Extend the Project

### Adding a new Security Check
1.  **Open `js/scanner.js`**.
2.  **Add your logic:**
    ```javascript
    export async function checkNewSetting(bucketName, client) {
        // 1. Send command
        // 2. Process response
        // 3. Return standard object
    }
    ```
3.  **Update `runAllChecks`**:
    ```javascript
    results.push(await checkNewSetting(bucketName, client));
    ```
4.  **Rebuild:** Run `npx esbuild js/main.js --bundle --outfile=js/bundle.js`.

---

## 🛠️ Developer Workflow (Best Practices)

### 1. The Bundle Rule
Always remember: **If you edit a `.js` file, you MUST re-bundle.** The browser only reads `js/bundle.js`. It does not read your individual files like `main.js` or `scanner.js`.

### 2. The Two-Terminal Rule
To test your changes, you must have two terminals open:
1.  **Terminal 1:** `python -m http.server 8000` (The Web UI)
2.  **Terminal 2:** `node proxy.js` (The CORS Proxy)

### 3. Debugging with the Console
If the UI "freezes" or doesn't show buckets, your best friend is `F12` -> `Network Tab`. 
*   Look for requests to `127.0.0.1:8080`. 
*   If they are failing, the proxy is down. 
*   If they are returning `403`, your AWS credentials or IAM permissions are wrong.

---

## 📈 Future Ideas for Extension
*   **Fix-It Buttons:** Add a button that automatically applies the fix (e.g. Enables encryption) via the tool.
*   **Multi-Account Scanning:** Allow scanning multiple AWS accounts in one session.
*   **Compliance Frameworks:** Map findings to industry standards like CIS AWS Foundations or SOC2.

---
**Congratulations!** You now have a complete understanding of the AWS S3 Security Scanner. Happy Auditing! 🛡️
