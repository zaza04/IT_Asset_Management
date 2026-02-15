---
description: Generate unit tests for a file
model: anthropic/claude-sonnet-4-20250514
---

# Generate Unit Tests

Generate comprehensive unit tests for: $ARGUMENTS

## Requirements

1. Use the project's existing test framework (detect from package.json or existing test files)
2. Cover edge cases and error scenarios
3. Use descriptive test names
4. Mock external dependencies appropriately
5. Follow existing test patterns in the codebase

## Steps

1. First, analyze the file to understand what needs to be tested
2. Check existing test patterns in the project
3. Generate tests with proper structure
4. Place tests in the appropriate location (same folder with `.test.ts` or `__tests__/` directory)

Create tests that are:
- Isolated and independent
- Fast to run
- Deterministic (no flaky tests)
- Well-documented
