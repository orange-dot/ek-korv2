# Skill: codex-review

Technical documentation review following codex-report.md pattern.

## When to Use

- Periodic project health check
- Before major milestones
- When suspecting technical issues

## What It Analyzes

### 1. Specification Consistency
- EK3 parameters across all documents
- Calculations (module count, power, costs)
- Cross-document references

### 2. Technical Feasibility
- Power electronics topology
- Thermal design
- Communication protocols
- Safety and compliance

### 3. Open Questions
- Undefined specifications
- Conflicting information
- Missing documentation

## Output Format

```markdown
# Codex Technical Review Report

## Scope
[List of reviewed documents]

## Findings

### Inconsistencies
1. [Description]
   - File A: value X
   - File B: value Y

### Feasibility Concerns
1. [Description]
   - Risk level: High/Medium/Low

### Open Questions
1. [Question]

## Recommendations
1. [Action]
```

## Steps

1. Scan all technical documents
2. Compare with SPECIFICATIONS.md
3. Identify issues
4. Generate report

## Example

```
/codex-review full
```