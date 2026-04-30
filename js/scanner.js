// js/scanner.js
import { 
    GetPublicAccessBlockCommand,
    GetBucketEncryptionCommand,
    GetBucketVersioningCommand,
    GetBucketLoggingCommand,
    GetBucketPolicyCommand,
    GetBucketLifecycleConfigurationCommand
} from "https://cdn.jsdelivr.net/npm/@aws-sdk/client-s3/dist-es/index.js";
import { s3Client } from './aws-config.js';

/**
 * Helper to safely execute S3 commands.
 * Some commands throw an error if the configuration does not exist (e.g., no encryption).
 */
async function safeExecute(command) {
    try {
        return await s3Client.send(command);
    } catch (error) {
        return { error: error.name };
    }
}

/**
 * 1. Check Public Access Block
 * Concept: Ensures that bucket settings block public reads/writes, preventing accidental data leaks.
 */
export async function checkPublicAccess(bucketName) {
    const res = await safeExecute(new GetPublicAccessBlockCommand({ Bucket: bucketName }));
    
    if (res.error === 'NoSuchPublicAccessBlockConfiguration' || res.error) {
        return { name: "Public Access Block", status: "FAIL", detail: "Not configured", severity: "HIGH" };
    }

    const config = res.PublicAccessBlockConfiguration;
    const isProtected = config.BlockPublicAcls && config.IgnorePublicAcls && config.BlockPublicPolicy && config.RestrictPublicBuckets;

    if (isProtected) {
        return { name: "Public Access Block", status: "PASS", detail: "All public access blocked", severity: "LOW" };
    } else {
        return { name: "Public Access Block", status: "FAIL", detail: "Partial or missing public blocks", severity: "HIGH" };
    }
}

/**
 * 2. Check Encryption (SSE)
 * Concept: Data at rest should be encrypted to protect against physical drive theft or unauthorized backend access.
 */
export async function checkEncryption(bucketName) {
    const res = await safeExecute(new GetBucketEncryptionCommand({ Bucket: bucketName }));
    
    if (res.error) {
        return { name: "Encryption (At Rest)", status: "FAIL", detail: "Server-side encryption disabled", severity: "HIGH" };
    }

    const rules = res.ServerSideEncryptionConfiguration?.Rules;
    if (rules && rules.length > 0) {
        const algo = rules[0].ApplyServerSideEncryptionByDefault.SSEAlgorithm;
        return { name: "Encryption (At Rest)", status: "PASS", detail: `Enabled (${algo})`, severity: "LOW" };
    }
    
    return { name: "Encryption (At Rest)", status: "FAIL", detail: "No default encryption rule", severity: "HIGH" };
}

/**
 * 3. Check Versioning
 * Concept: Protects against accidental deletion or ransomware by keeping multiple variants of an object.
 */
export async function checkVersioning(bucketName) {
    const res = await safeExecute(new GetBucketVersioningCommand({ Bucket: bucketName }));
    
    if (res.Status === "Enabled") {
        return { name: "Versioning", status: "PASS", detail: "Enabled", severity: "LOW" };
    } else {
        return { name: "Versioning", status: "FAIL", detail: res.Status ? res.Status : "Suspended or Unconfigured", severity: "MEDIUM" };
    }
}

/**
 * 4. Check Access Logging
 * Concept: Essential for forensics. If a breach happens, logs tell you who accessed what and when.
 */
export async function checkLogging(bucketName) {
    const res = await safeExecute(new GetBucketLoggingCommand({ Bucket: bucketName }));
    
    if (res.LoggingEnabled) {
        return { name: "Access Logging", status: "PASS", detail: `Logging to: ${res.LoggingEnabled.TargetBucket}`, severity: "LOW" };
    } else {
        return { name: "Access Logging", status: "WARN", detail: "Server access logging is disabled", severity: "MEDIUM" };
    }
}

/**
 * 5. Check MFA Delete (requires checking Versioning Config)
 * Concept: Requires physical hardware token to delete files, adding a strong layer against compromised admin accounts.
 */
export async function checkMFADelete(bucketName) {
    const res = await safeExecute(new GetBucketVersioningCommand({ Bucket: bucketName }));
    
    if (res.MFADelete === "Enabled") {
        return { name: "MFA Delete", status: "PASS", detail: "Enabled", severity: "LOW" };
    } else {
        return { name: "MFA Delete", status: "WARN", detail: "MFA Delete is not enforced", severity: "LOW" };
    }
}

/**
 * 6. Check HTTPS Enforced Policy & Cross-Account Access
 * Concept: HTTPS ensures data in transit is encrypted. Cross-account access can lead to privilege escalation if external IDs aren't restricted.
 */
export async function checkPolicy(bucketName) {
    const res = await safeExecute(new GetBucketPolicyCommand({ Bucket: bucketName }));
    
    let httpsStatus = { name: "HTTPS Only Policy", status: "FAIL", detail: "Not enforced in policy", severity: "MEDIUM" };
    let crossAccountStatus = { name: "Cross-Account Limits", status: "PASS", detail: "No obvious external principals found", severity: "LOW" };
    
    if (res.error) {
        return [httpsStatus, { name: "Cross-Account Limits", status: "WARN", detail: "No bucket policy exists", severity: "LOW" }];
    }

    try {
        const policy = JSON.parse(res.Policy);
        let enforcesHttps = false;
        let hasExternalPrincipal = false;

        policy.Statement.forEach(statement => {
            // Check HTTPS
            if (statement.Effect === "Deny" && statement.Condition?.Bool?.["aws:SecureTransport"] === "false") {
                enforcesHttps = true;
            }
            // Simple check for external principal (wildcards or other account IDs)
            if (statement.Principal === "*" || (statement.Principal?.AWS && statement.Principal.AWS !== "*")) {
                hasExternalPrincipal = true;
            }
        });

        if (enforcesHttps) {
            httpsStatus = { name: "HTTPS Only Policy", status: "PASS", detail: "Enforced via Deny rule", severity: "LOW" };
        }
        if (hasExternalPrincipal) {
            crossAccountStatus = { name: "Cross-Account Limits", status: "WARN", detail: "Policy allows external principals", severity: "MEDIUM" };
        }

    } catch (e) {
        console.error("Failed to parse policy", e);
    }

    return [httpsStatus, crossAccountStatus];
}

/**
 * 7. Check Lifecycle Policies
 * Concept: Old data should be transitioned to cold storage or deleted to reduce attack surface and cost.
 */
export async function checkLifecycle(bucketName) {
    const res = await safeExecute(new GetBucketLifecycleConfigurationCommand({ Bucket: bucketName }));
    
    if (res.error) {
        return { name: "Lifecycle Rules", status: "FAIL", detail: "No lifecycle rules configured", severity: "LOW" };
    }

    return { name: "Lifecycle Rules", status: "PASS", detail: `${res.Rules.length} rule(s) active`, severity: "LOW" };
}

/**
 * Master function to run all checks on a single bucket
 */
export async function runAllChecks(bucketName) {
    const results = [];
    results.push(await checkPublicAccess(bucketName));
    results.push(await checkEncryption(bucketName));
    results.push(await checkVersioning(bucketName));
    results.push(await checkLogging(bucketName));
    results.push(await checkMFADelete(bucketName));
    
    const policyChecks = await checkPolicy(bucketName);
    results.push(...policyChecks);
    
    results.push(await checkLifecycle(bucketName));
    
    return results;
}
