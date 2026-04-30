// js/aws-config.js
import { S3Client } from "@aws-sdk/client-s3";

// Global reference to the connected client
export let s3Client = null;

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
