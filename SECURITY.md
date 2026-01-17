# Security Policy

## Supported Versions

This project is currently in active development. Security updates are provided for the following:

| Component | Supported          |
| --------- | ------------------ |
| Main branch | :white_check_mark: |
| Web demo (latest) | :white_check_mark: |
| EK-KOR firmware | :white_check_mark: |
| Documentation only | Not applicable |

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Email:** bojan@elektrokombinacija.com

**Subject line:** `[SECURITY] Brief description of the issue`

### What to Include

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Any suggested fixes (optional)

### What to Expect

- **Initial response:** Within 48 hours acknowledging receipt
- **Status updates:** Every 5 business days until resolution
- **Resolution timeline:** Depends on severity
  - Critical: Target fix within 7 days
  - High: Target fix within 30 days
  - Medium/Low: Target fix within 90 days

### Disclosure Policy

- Please do not publicly disclose the vulnerability until we have had a chance to address it
- We will coordinate with you on disclosure timing
- We will credit reporters in our release notes (unless you prefer anonymity)

### Scope

This security policy covers:
- Firmware and embedded code (`ek-kor2/`)
- Build and deployment scripts
- Any credentials or secrets accidentally committed

### Out of Scope

- Documentation content
- Theoretical/conceptual design documents
- Third-party dependencies (report these to the respective maintainers)

## Security Best Practices

Contributors should:
- Never commit credentials, API keys, or secrets
- Use environment variables for sensitive configuration
- Follow secure coding guidelines for embedded systems (MISRA C where applicable)
- Review dependencies for known vulnerabilities before adding them

