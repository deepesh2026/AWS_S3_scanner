// proxy.js
const cors_proxy = require('cors-anywhere');

// Listen on a specific host via the HOST environment variable
const host = process.env.HOST || '127.0.0.1';
// Listen on a specific port via the PORT environment variable
const port = process.env.PORT || 8080;

cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: [],
    removeHeaders: []
}).listen(port, host, function() {
    console.log(`\n✅ CORS Proxy Server is running!`);
    console.log(`📡 Listening on: http://${host}:${port}`);
    console.log(`\nYou can now run the audit tool securely from your browser.`);
});
