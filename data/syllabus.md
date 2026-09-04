# Arena Web Security Course Curriculum & Syllabus

## Course Overview
Arena Web Security is an intensive, hands-on cybersecurity and ethical hacking training program designed to take students from foundational web concepts to advanced vulnerability assessment and penetration testing.

## Course Modules
### Module 1: Web Architecture & HTTP/HTTPS Internals
- Client-server architecture, DNS resolution, and TCP handshake.
- HTTP Request & Response headers, methods (GET, POST, PUT, DELETE, OPTIONS).
- Cookies, Sessions, LocalStorage, and CORS fundamentals.

### Module 2: Reconnaissance & Attack Surface Mapping
- Passive Recon: OSINT, Google Dorking, Shodan, WHOIS, Certificate Transparency.
- Active Recon: Subdomain enumeration (Sublist3r, Amass), Port scanning (Nmap), Directory fuzzing (Feroxbuster, Gobuster).
- Technology profiling with Wappalyzer, WhatWeb.

### Module 3: Broken Access Control & IDOR
- Insecure Direct Object References (IDOR) on REST APIs and web endpoints.
- Vertical vs. Horizontal Privilege Escalation.
- Missing function-level access control and parameter tampering.

### Module 4: Injection Vulnerabilities
- SQL Injection (SQLi): In-band (UNION based), Error-based, Blind (Boolean & Time-based).
- SQLmap automation and manual bypass of Web Application Firewalls (WAF).
- OS Command Injection: Blind command execution, reverse shell generation.
- Prevention: Prepared Statements (Parameterized Queries) and input validation.

### Module 5: Client-Side Attacks (XSS & CSRF)
- Cross-Site Scripting: Reflected, Stored, and DOM-based XSS.
- Cookie stealing, session hijacking, and defacement payloads.
- Cross-Site Request Forgery (CSRF): Anti-CSRF token bypass, SameSite cookie attributes.
- Defense: Context-aware output encoding, Content Security Policy (CSP).

### Module 6: Server-Side Request Forgery (SSRF) & XXE
- SSRF: Internal port scanning, accessing AWS/GCP cloud metadata instances (169.254.169.254).
- XML External Entity (XXE): Arbitrary file read (`/etc/passwd`), SSRF via XXE.

### Module 7: Authentication & JWT Security
- Brute-force attacks, rate limit bypass with headers (X-Forwarded-For).
- JWT (JSON Web Tokens) attacks: None algorithm flaw, weak HMAC secrets cracking with hashcat, public/private key confusion.

### Module 8: API Security & Final Capstone CTF
- REST API vulnerability testing with Postman and Burp Suite.
- Mass assignment, BOLA (Broken Object Level Authorization).
- 48-Hour Live Capstone CTF Exam: Hands-on exploitation of realistic vulnerable enterprise web targets.
