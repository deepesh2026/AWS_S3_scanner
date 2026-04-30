# Module 4: AWS SDK & Authentication

## 📦 AWS SDK v3
We are using the **AWS SDK for JavaScript v3**. This is the modern version of the SDK, which is modular. Instead of downloading the "whole AWS library," we only import the specific pieces we need for S3.

This makes our final `bundle.js` smaller and faster.

## 🏗️ The Bundling Process (`esbuild`)
Browsers cannot read `import { S3Client } from "@aws-sdk/client-s3"` directly from `node_modules`. We use a tool called `esbuild` to compile all our modular code into a single file called `js/bundle.js`.

**Command used:**
```bash
npx esbuild js/main.js --bundle --outfile=js/bundle.js
```
Whenever you change `main.js`, `scanner.js`, or `aws-config.js`, you **must** run this command again to update the bundle!

## 🔐 Authentication Logic (`aws-config.js`)
When the user submits the form, `initializeAWS` is called. 

```javascript
let currentCreds = null;

export function initializeAWS(accessKeyId, secretAccessKey, region) {
    currentCreds = {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey
    };
    // Create the initial global client
    s3Client = getRegionClient(region); 
    return true;
}
```

### Key Concepts:
1.  **Stored in Variables:** The credentials are stored in the `currentCreds` variable inside the closure of the module. They are never saved to disk.
2.  **Signature Version 4 (SigV4):** The SDK automatically uses your secret key to "sign" every request. This signature proves to AWS that you have the key without actually sending the key itself over the internet.
3.  **Client Objects:** An `S3Client` is an object that holds the connection settings (region, keys). We create multiple clients during a single session to talk to different regions.

---
**Next Up:** [Module 5: Regional Discovery Logic](05_regional_discovery_logic.md)
