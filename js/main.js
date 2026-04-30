import { initializeAWS, s3Client, disconnectAWS } from './aws-config.js';
import { runAllChecks } from './scanner.js';
import { runAllChecks } from './scanner.js';
import { generateReport } from './reporter.js';

// Global array to store final scan data
export let auditResults = [];

// DOM Elements
const authForm = document.getElementById('authForm');
const credentialsScreen = document.getElementById('credentialsScreen');
const scanningScreen = document.getElementById('scanningScreen');
const reportScreen = document.getElementById('reportScreen');
const headerStatus = document.getElementById('headerStatus');
const activeRegionBadge = document.getElementById('activeRegionBadge');
const disconnectBtn = document.getElementById('disconnectBtn');
const scanLogFeed = document.getElementById('scanLogFeed');
const scanStatusText = document.getElementById('scanStatusText');

/**
 * Switch active screen
 */
function showScreen(screenElement) {
    credentialsScreen.classList.add('hidden');
    scanningScreen.classList.add('hidden');
    reportScreen.classList.add('hidden');
    screenElement.classList.remove('hidden');
}

/**
 * Add a log message to the scanning screen
 */
function log(message) {
    const logItem = document.createElement('div');
    logItem.className = 'log-item';
    logItem.textContent = `> ${message}`;
    scanLogFeed.prepend(logItem);
}

/**
 * Handle Auth Form Submission
 */
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const accessKey = document.getElementById('accessKey').value.trim();
    const secretKey = document.getElementById('secretKey').value.trim();
    const region = document.getElementById('region').value;
    const bucketListRaw = document.getElementById('bucketList').value;
    const targetBuckets = bucketListRaw.split(',').map(s => s.trim()).filter(s => s.length > 0);

    // 1. Initialize AWS SDK
    if (initializeAWS(accessKey, secretKey, region)) {
        // UI Updates
        headerStatus.classList.remove('hidden');
        activeRegionBadge.textContent = `Region: ${region}`;
        showScreen(scanningScreen);
        log("AWS Client initialized successfully.");
        
        // 2. Start the scan process using the provided bucket list
        await testConnection(targetBuckets);
    } else {
        alert("Failed to initialize AWS. Check console.");
    }
});

/**
 * Handle Disconnect
 */
disconnectBtn.addEventListener('click', () => {
    disconnectAWS();
    // Clear form
    document.getElementById('accessKey').value = '';
    document.getElementById('secretKey').value = '';
    
    // Reset UI
    headerStatus.classList.add('hidden');
    scanLogFeed.innerHTML = '';
    showScreen(credentialsScreen);
});

/**
 * Test Connection by running scans on provided buckets
 */
async function testConnection(targetBuckets) {
    
    try {
        const buckets = targetBuckets.map(name => ({ Name: name }));
        log(`Success! Queued ${buckets.length} buckets.`);
        
        scanStatusText.textContent = `Queued ${buckets.length} buckets. Starting security checks...`;
        
        // Loop through each bucket and run the checks
        for (let i = 0; i < buckets.length; i++) {
            const b = buckets[i];
            scanStatusText.textContent = `Scanning bucket ${i + 1} of ${buckets.length}: ${b.Name}...`;
            
            // Update progress bar
            const percent = ((i) / buckets.length) * 100;
            document.getElementById('scanProgressBar').style.width = `${percent}%`;

            log(`Starting checks for ${b.Name}...`);
            const checks = await runAllChecks(b.Name);
            
            // Save the results
            auditResults.push({
                bucketName: b.Name,
                checks: checks
            });
            
            log(`Completed ${checks.length} checks for ${b.Name}.`);
        }

        document.getElementById('scanProgressBar').style.width = `100%`;
        scanStatusText.textContent = "Audit complete. Generating report...";
        
        // Transition to report screen
        setTimeout(() => {
            showScreen(reportScreen);
            generateReport(auditResults);
        }, 1500);

    } catch (error) {
        log(`ERROR: ${error.message}`);
        scanStatusText.textContent = "Authentication Failed.";
        console.error("AWS Error:", error);
        
        if (error.name === 'InvalidAccessKeyId') {
            log("Security Context: Your Access Key ID is invalid or doesn't exist.");
        } else if (error.name === 'SignatureDoesNotMatch') {
            log("Security Context: Your Secret Key is incorrect.");
        } else if (error.name === 'AccessDenied') {
            log("Security Context: IAM User does not have 's3:ListAllMyBuckets' permission.");
        }
    }
}
