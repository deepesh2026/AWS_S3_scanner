// js/reporter.js

let complianceChartInstance = null;

/**
 * Main function to generate the dashboard from audit results
 */
export function generateReport(auditResults) {
    let totalChecks = 0;
    let passedChecks = 0;
    let failedChecks = 0;
    let warnings = 0;

    const container = document.getElementById('bucketReportsContainer');
    container.innerHTML = ''; // clear existing

    auditResults.forEach(bucketData => {
        let bucketPassed = 0;
        let bucketFailed = 0;
        let bucketWarn = 0;
        let bucketRisk = "LOW";

        const checksHtml = bucketData.checks.map(check => {
            totalChecks++;
            
            let statusClass = '';
            let icon = '';

            if (check.status === 'PASS') {
                passedChecks++;
                bucketPassed++;
                statusClass = 'status-pass';
                icon = '✅';
            } else if (check.status === 'FAIL') {
                failedChecks++;
                bucketFailed++;
                statusClass = 'status-fail';
                icon = '❌';
            } else if (check.status === 'WARN') {
                warnings++;
                bucketWarn++;
                statusClass = 'status-warn';
                icon = '⚠️';
            }

            return `
                <li class="check-item">
                    <div class="check-icon">${icon}</div>
                    <div class="check-details">
                        <span class="check-name">${check.name}</span>
                        <span class="check-desc">${check.detail}</span>
                    </div>
                    <div class="check-status ${statusClass}">${check.status}</div>
                </li>
            `;
        }).join('');

        // Determine Bucket Risk Level
        let badgeClass = 'badge-risk-low';
        let riskLabel = 'LOW RISK';
        
        // Let's assume if there is any critical/high failure, it's high risk
        const hasHighRiskFail = bucketData.checks.some(c => c.status === 'FAIL' && c.severity === 'HIGH');
        
        if (hasHighRiskFail) {
            bucketRisk = "HIGH";
            badgeClass = "badge-risk-high";
            riskLabel = "HIGH RISK 🔴";
        } else if (bucketFailed > 0 || bucketWarn > 0) {
            bucketRisk = "MEDIUM";
            badgeClass = "badge-risk-medium";
            riskLabel = "MED RISK 🟡";
        } else {
            riskLabel = "SECURE 🟢";
        }

        // Create Card HTML
        const cardHtml = `
            <div class="bucket-card">
                <div class="bucket-header">
                    <div class="bucket-name">📦 <i>${bucketData.bucketName}</i></div>
                    <div class="badge ${badgeClass}">${riskLabel}</div>
                </div>
                <ul class="check-list">
                    ${checksHtml}
                </ul>
                <button class="raw-data-toggle" onclick="this.nextElementSibling.classList.toggle('open')">▼ View Raw JSON Data</button>
                <div class="raw-data-content">${JSON.stringify(bucketData.checks, null, 2)}</div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', cardHtml);
    });

    // Update Summary Cards
    document.getElementById('totalBucketsCount').textContent = auditResults.length;
    document.getElementById('passedChecksCount').textContent = passedChecks;
    document.getElementById('failedChecksCount').textContent = failedChecks;
    document.getElementById('warningsCount').textContent = warnings;

    // Draw Chart
    drawComplianceChart(passedChecks, failedChecks, warnings);
    
    // Setup Export Button
    setupExportButton(auditResults);
}

/**
 * Draws the Chart.js Doughnut Chart
 */
function drawComplianceChart(passed, failed, warnings) {
    const ctx = document.getElementById('complianceChart').getContext('2d');
    
    // Destroy existing chart if it exists (for re-scans)
    if (complianceChartInstance) {
        complianceChartInstance.destroy();
    }

    complianceChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Passed', 'Failed', 'Warnings'],
            datasets: [{
                data: [passed, failed, warnings],
                backgroundColor: [
                    '#10b981', // Success green
                    '#ef4444', // Danger red
                    '#f59e0b'  // Warning yellow
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#f8fafc' }
                }
            },
            cutout: '70%'
        }
    });
}

/**
 * Setup the Export to JSON functionality
 */
function setupExportButton(data) {
    const btn = document.getElementById('exportBtn');
    btn.onclick = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "s3_security_audit_report.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };
}
