# Skill: patent-draft

Create and update patent disclosure documents.

## When to Use

- When identifying new innovation for protection
- When updating existing disclosure
- For patent application preparation

## Patent Disclosure Structure

```
patent/01-IP-FOUNDATION/
├── 01-INVENTION-DISCLOSURE-xxx.md
├── 02-INVENTION-DISCLOSURE-xxx.md
└── ...
```

## Disclosure Template

```markdown
# Invention Disclosure: [NAME]

**ID:** EK-2026-XXX
**Inventor:** Bojan Janjatović
**Date of Conception:** YYYY-MM-DD
**Priority Date:** YYYY-MM-DD

## Problem Statement
[Problem being solved]

## Technical Solution
[Technical solution]

## Key Claims
1. [Claim 1]
2. [Claim 2]
...

## Prior Art Search
[Known solutions and differences]

## Commercial Advantage
[Business advantage]
```

## Steps

1. Identify new innovation
2. Check if exists in patent/01-IP-FOUNDATION/
3. Create disclosure using template
4. Update web/src/pages/PatentPage.jsx
5. Commit with GPG signature for priority date

## Example

```
/patent-draft "Adaptive Thermal Management" thermal-ai
```