---
description: Quick debug session helper
model: anthropic/claude-sonnet-4-20250514
---

# Debug Helper

Debug issue: $ARGUMENTS

## Process

1. **Gather context**
   !`git status`
   !`git diff HEAD~1`

2. **Check logs/errors** - Look for relevant error messages

3. **Trace the issue** - Follow the code path

4. **Identify root cause** - Find where things go wrong

5. **Propose fix** - Suggest a solution with explanation

## Checklist

- [ ] Reproduced the issue
- [ ] Found the root cause (not just symptoms)
- [ ] Verified fix doesn't break other functionality
- [ ] Added logging/tests to prevent regression

## Output

Provide:
- Clear description of what's wrong
- Root cause analysis
- Proposed fix with code changes
- How to verify the fix works
