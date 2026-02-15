---
description: Add documentation to code
model: anthropic/claude-sonnet-4-20250514
subtask: true
---

# Document Code

Add documentation to: $ARGUMENTS

## Standards

1. **JSDoc/TSDoc** for functions and classes:
   - Description of what it does
   - @param for each parameter with type and description
   - @returns for return value
   - @throws for exceptions
   - @example for usage examples

2. **Inline comments** for complex logic:
   - Explain WHY, not WHAT
   - Keep them concise
   - Update when code changes

3. **README** for modules/packages:
   - Purpose and overview
   - Installation/setup
   - API reference
   - Examples

## Guidelines

- Don't over-document obvious code
- Keep docs close to the code they describe
- Use consistent formatting
- Include edge cases in examples
