# Module 6: Security Audit Engine

## 🧠 The "Brain": `scanner.js`
The `scanner.js` module contains the actual logic for every security check. It doesn't care about the UI or the proxy; it just knows how to interpret AWS responses.

## 🛡️ The `safeExecute` Pattern
Many AWS S3 commands throw an "Error" if a feature is disabled. For example, if you ask for "Encryption" settings on a bucket that has no encryption, AWS doesn't return `enabled: false`—it returns an `error`.

To keep our code clean, we use a `safeExecute` helper:
```javascript
async function safeExecute(command, client) {
    try {
        return await client.send(command);
    } catch (error) {
        // We catch the error and return the error name as a string
        return { error: error.name };
    }
}
```

## 🔍 Anatomy of a Security Check
Every check function follows a predictable 3-step pattern:
1.  **Request:** Call the S3 API.
2.  **Evaluate:** Look at the response or the error name.
3.  **Standardize:** Return a simple object with `{ name, status, detail, severity }`.

### Example: Public Access Block Check
```javascript
export async function checkPublicAccess(bucketName, client) {
    const res = await safeExecute(new GetPublicAccessBlockCommand({ Bucket: bucketName }), client);
    
    // Case 1: The configuration doesn't exist (FAIL)
    if (res.error === 'NoSuchPublicAccessBlockConfiguration') {
        return { name: "Public Access Block", status: "FAIL", detail: "Not configured (Default Off)", severity: "HIGH" };
    } 
    // Case 2: Some other error (e.g. AccessDenied)
    else if (res.error) {
        return { name: "Public Access Block", status: "FAIL", detail: `API Error: ${res.error}`, severity: "HIGH" };
    }

    // Case 3: We have a config! Check if all 4 blocks are TRUE
    const config = res.PublicAccessBlockConfiguration;
    const isProtected = config.BlockPublicAcls && config.IgnorePublicAcls && config.BlockPublicPolicy && config.RestrictPublicBuckets;

    return isProtected ? 
        { name: "Public Access Block", status: "PASS", detail: "All public access blocked", severity: "LOW" } :
        { name: "Public Access Block", status: "FAIL", detail: "Partial or missing public blocks", severity: "HIGH" };
}
```

## 🏗️ Adding New Checks
To add a new check, you simply:
1.  Define a new `checkSomething` function in `scanner.js`.
2.  Import the required Command from `@aws-sdk/client-s3`.
3.  Add `results.push(await checkSomething(bucketName, client))` to the `runAllChecks` master function.

---
**Next Up:** [Module 7: Frontend & Reporting](07_frontend_and_reporting.md)
