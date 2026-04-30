const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Simple static server
const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath == './') filePath = './index.html';
    
    let extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
    }

    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404);
            res.end('File not found');
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(8000, async () => {
    console.log('Test Server running on 8000');
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
    page.on('request', request => {
        console.log('BROWSER REQUEST:', request.method(), request.url());
    });
    page.on('response', async response => {
        console.log('BROWSER RESPONSE:', response.status(), response.url());
        if (response.url().includes('8080')) {
            try {
                const text = await response.text();
                console.log('PROXY RESPONSE BODY:', text.substring(0, 200));
            } catch(e) {}
        }
    });

    try {
        await page.goto('http://127.0.0.1:8000');
        
        // Fill credentials
        await page.type('#accessKey', 'AKIAIOSFODNN7EXAMPLE');
        await page.type('#secretKey', 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY');
        
        // Submit
        await page.click('button[type="submit"]');
        
        // Wait a bit to let requests happen
        await new Promise(r => setTimeout(r, 3000));
        
    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await browser.close();
        server.close();
        process.exit(0);
    }
});
