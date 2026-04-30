# Module 7: Frontend & Reporting

## 🎨 UI Orchestration: `main.js`
`main.js` is the conductor of the orchestra. It doesn't do the security logic itself, but it tells everyone else when to start and what to do with the data.

### 1. Screen Switching
We use a simple `showScreen` function that adds/removes the `.hidden` CSS class to different `<section>` tags. This creates a "Single Page Application" (SPA) feel without using a heavy framework like React.

### 2. Logging
Every step of the scan is logged to the `scanLogFeed`. This is critical for the user to understand what's happening (e.g., "Discovering Region...", "Starting checks...").

## 📊 Visualization: `reporter.js`
Once the scan is done, we have a massive array of JSON results. `reporter.js` turns this data into a beautiful dashboard.

### 1. Risk Scoring
The tool automatically assigns a "Risk Level" to each bucket:
*   **🔴 HIGH RISK:** Any check with `status: FAIL` and `severity: HIGH` (e.g., No Encryption or No Public Access Block).
*   **🟡 MEDIUM RISK:** Any other failure or warning.
*   **🟢 SECURE:** All checks passed.

### 2. Chart.js Integration
We use the `Chart.js` library to draw the doughnut chart. 
*   **Canvas Element:** The chart is drawn into a `<canvas>` element in `index.html`.
*   **Destruction Pattern:** Before drawing a new chart (like if the user runs a second scan), we must call `chartInstance.destroy()` to prevent memory leaks and glitchy UI rendering.

## 📥 Exporting Data
We use a "Virtual Link" trick to let the user download the results as a JSON file without needing a backend server.

```javascript
function setupExportButton(data) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "s3_security_audit_report.json");
    downloadAnchorNode.click(); // Trigger the download
}
```

---
**Next Up:** [Module 8: Maintenance & Extensions](08_maintenance_and_extensions.md)
