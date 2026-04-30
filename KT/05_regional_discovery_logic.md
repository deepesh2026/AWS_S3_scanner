# Module 5: Regional Discovery Logic

## 🔴 The "PermanentRedirect" Nightmare
S3 is a "Global" service, but every bucket actually lives in a specific "Region" (like `us-east-1` or `eu-north-1`). 

If you try to ask a `us-east-1` server for the settings of a bucket that lives in `eu-north-1`, the server will give you a **301 Permanent Redirect** error. Most browsers and SDKs won't follow this automatically for security configuration requests.

## 🟢 The Solution: Automated Discovery
To make the tool "Region Agnostic" (where the user doesn't have to select a region), we implemented a discovery loop in `main.js`.

### The Flow:
1.  **List Buckets:** We call `ListBucketsCommand` using a default region (`us-east-1`). This gives us a list of names.
2.  **Get Location:** For every bucket, we call `GetBucketLocationCommand`.
3.  **Identify Region:**
    *   If it returns `null` or empty, the region is `us-east-1`.
    *   Otherwise, it returns the string (e.g., `"eu-north-1"`).
4.  **Spawn Regional Client:** We call `getRegionClient(bucketRegion)` to create a new AWS client pointed specifically at that data center.

### Code Snippet from `main.js`:
```javascript
// 1. Automatically determine the bucket's region
let bucketRegion = 'us-east-1'; 
try {
    const locRes = await s3Client.send(new GetBucketLocationCommand({ Bucket: b.Name }));
    if (locRes.LocationConstraint) {
        bucketRegion = locRes.LocationConstraint;
    }
} catch (e) {
    console.warn(`Defaulting to us-east-1 for ${b.Name}`);
}

// 2. Create a specific client for that region
const regionClient = getRegionClient(bucketRegion);

// 3. Run checks using the correct region client
const checks = await runAllChecks(b.Name, regionClient);
```

## 🚀 Why this is powerful
This logic allows the tool to scan a massive AWS account with 100 buckets spread across the globe in one single click, without the user ever needing to know which bucket is where.

---
**Next Up:** [Module 6: Security Audit Engine](06_security_audit_engine.md)
