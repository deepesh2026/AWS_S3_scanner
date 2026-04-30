# Module 3: The Proxy & CORS Bypass

## 🔍 Understanding the "CORS" Problem
CORS (Cross-Origin Resource Sharing) is a security feature in browsers. It prevents a script on `http://localhost:8000` from making a request to `https://s3.amazonaws.com` unless AWS explicitly says "Yes, I allow localhost:8000 to talk to me."

Unfortunately, for the `ListBuckets` API, AWS does not send the headers that browsers require. This results in a "Blocked by CORS" error in your console.

## 🛠️ The Solution Part 1: `proxy.js`
We use a library called `cors-anywhere`. Our `proxy.js` is a tiny Node.js script that:
1.  Listens on `http://127.0.0.1:8080`.
2.  Takes any URL passed to it (e.g., `http://127.0.0.1:8080/https://s3.amazonaws.com`).
3.  Makes the request to the real URL from the server-side (where CORS doesn't exist).
4.  Adds the `Access-Control-Allow-Origin: *` header to the response and sends it back to the browser.

```javascript
// Simplified proxy.js logic
const cors_proxy = require('cors-anywhere');
cors_proxy.createServer({
    originWhitelist: [], // Allow all origins
    requireHeader: ['origin', 'x-requested-with'],
    removeHeaders: ['cookie', 'cookie2']
}).listen(8080, '127.0.0.1');
```

## 🛠️ The Solution Part 2: The Interceptor (`aws-config.js`)
The AWS SDK doesn't know about our proxy. To fix this, we "hijack" the browser's global `fetch` function.

Every time the AWS SDK tries to talk to AWS, our interceptor steps in:
1.  It checks if the URL contains `amazonaws.com`.
2.  If it does, it prepends our proxy URL.
3.  It wraps everything back into a `Request` object and lets the browser continue.

```javascript
// The "Magic" in aws-config.js
const originalFetch = window.fetch;
window.fetch = async function(input, init) {
    const proxyUrl = 'http://127.0.0.1:8080/';
    let urlStr = (input instanceof Request) ? input.url : input;

    if (urlStr.includes('amazonaws.com')) {
        const newUrlStr = proxyUrl + urlStr;
        // Rewrite the request to go through the local proxy
        input = (input instanceof Request) ? new Request(newUrlStr, input) : newUrlStr;
    }
    return originalFetch(input, init);
}
```

## ⚠️ Important Note
The proxy **must** be running for the tool to work. If you see "CORS Error" or "Failed to Fetch," it almost always means you forgot to run `node proxy.js` in your terminal!

---
**Next Up:** [Module 4: AWS SDK & Authentication](04_aws_sdk_and_authentication.md)
