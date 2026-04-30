# Module 1: Introduction

## 📝 Overview
The **S3 Audit Tool** is a web-based application designed to help security engineers and developers quickly assess the security posture of their AWS S3 buckets. 

Unlike many security tools that require a backend server or a paid SaaS subscription, this tool is **completely client-side**. This means the code that audits your infrastructure runs directly in your web browser.

## 🔴 The Problem Statement: The CORS Wall
When we first started building this tool, we hit a major wall. AWS S3 does not allow a browser (like Chrome) to ask for a list of buckets directly from a standard website due to a security policy called **CORS** (Cross-Origin Resource Sharing).

Usually, to bypass this, you would need to build a backend server (Node.js, Python, Go) to talk to AWS on your behalf. However, that introduces a new security risk: **You have to send your AWS Secret Keys to that server.**

## ✅ The Solution: The "Private Proxy" Design
We chose a different path. We built a tool where:
1.  **The UI** runs in your browser.
2.  **The Proxy** runs locally on your machine.
3.  **The Keys** stay in your browser's memory and never leave your computer.

This architecture provides the power of a professional auditing tool with the privacy of a local script.

## 🎯 Project Goals
*   **Security:** Credentials must never be sent to a 3rd party server.
*   **Automation:** The tool should figure out the AWS regions automatically.
*   **Visuals:** Security findings should be easy to understand via a dashboard.
*   **Portability:** The final product is just a folder of files that anyone with Node.js and Python can run.

---
**Next Up:** [Module 2: Architecture Overview](02_architecture_overview.md)
