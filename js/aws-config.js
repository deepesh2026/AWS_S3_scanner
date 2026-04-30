// js/aws-config.js
import { S3Client } from "@aws-sdk/client-s3";

// Global reference to the connected client
export let s3Client = null;

// Intercept browser's native fetch API to route AWS calls through our local proxy
const originalFetch = window.fetch;
window.fetch = async function(input, init) {
    const proxyUrl = 'http://127.0.0.1:8080/';
    let urlStr = '';
    
    if (typeof input === 'string') {
        urlStr = input;
    } else if (input instanceof URL) {
        urlStr = input.href;
    } else if (input instanceof Request) {
        urlStr = input.url;
    }

    if (urlStr.includes('amazonaws.com')) {
        const newUrlStr = proxyUrl + urlStr;
        if (input instanceof Request) {
            // Re-create the request with the new URL, copying all options and headers
            input = new Request(newUrlStr, input);
        } else if (input instanceof URL) {
            input = new URL(newUrlStr);
        } else {
            input = newUrlStr;
        }
    }
    return originalFetch(input, init);
}

/**
 * Initializes the AWS S3 Client using the provided credentials
 */
export function initializeAWS(accessKeyId, secretAccessKey, region) {
    try {
        s3Client = new S3Client({
            region: region,
            credentials: {
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey
            }
        });
        return true;
    } catch (error) {
        console.error("Failed to initialize AWS Client", error);
        return false;
    }
}

/**
 * Clears the stored credentials
 */
export function disconnectAWS() {
    s3Client = null;
}
