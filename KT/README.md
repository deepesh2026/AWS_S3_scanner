# S3 Audit Tool: Knowledge Transfer (KT) Guide

Welcome to the official Knowledge Transfer guide for the AWS S3 Security Scanner. This guide is structured like a textbook to help you understand the "Why" and "How" behind every line of code in this project.

Whether you are looking to fix a bug, add a new security check, or just understand how the cloud talks to a browser, this guide is your primary reference.

## 📚 Table of Contents

### [Module 1: Introduction](01_introduction.md)
*   Problem Statement: The CORS Challenge
*   Project Goals & Vision
*   The "Vibe Coding" Journey

### [Module 2: Architecture Overview](02_architecture_overview.md)
*   High-Level Data Flow
*   Security Design (Client-Side First)
*   The Two-Process System

### [Module 3: The Proxy & CORS Bypass](03_the_proxy_and_cors.md)
*   What is CORS?
*   Deep Dive: `proxy.js`
*   The Fetch Interceptor (`aws-config.js`)

### [Module 4: AWS SDK & Authentication](04_aws_sdk_and_authentication.md)
*   AWS SDK v3 for JavaScript
*   Bundling with `esbuild`
*   Secure Credential Handling

### [Module 5: Regional Discovery Logic](05_regional_discovery_logic.md)
*   The `PermanentRedirect` Problem
*   Automated Region Detection
*   Dynamic Client Routing

### [Module 6: Security Audit Engine](06_security_audit_engine.md)
*   Inside `scanner.js`
*   Anatomy of a Security Check
*   The `safeExecute` Pattern

### [Module 7: Frontend & Reporting](07_frontend_and_reporting.md)
*   UI Orchestration (`main.js`)
*   Visualization with `Chart.js` (`reporter.js`)
*   JSON Data Export

### [Module 8: Maintenance & Extensions](08_maintenance_and_extensions.md)
*   How to add a new check
*   How to update dependencies
*   Best Practices for Future Growth

---

**How to use this guide:**
Each file is a standalone chapter. We recommend reading them in order if you are new to the project, or jumping to a specific module if you are looking to modify a particular feature.
