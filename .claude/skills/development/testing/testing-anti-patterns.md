# Testing Anti-Patterns

**Load this reference when:** writing or changing tests, adding mocks, or tempted to add test-only methods to production code.

## Overview

Tests must verify real behavior, not mock behavior.

**Core principle:** Test what the code does, not what the mocks do.

## The Iron Laws

```
1. NEVER test mock behavior
2. NEVER add test-only methods to production classes
3. NEVER mock without understanding dependencies
```

## Anti-Pattern 1: Testing Mock Behavior

```typescript
// BAD: Testing that the mock exists
test('renders sidebar', () => {
  render(<Page />);
  expect(screen.getByTestId('sidebar-mock')).toBeInTheDocument();
});

// GOOD: Test real component or don't mock it
test('renders sidebar', () => {
  render(<Page />);  // Don't mock sidebar
  expect(screen.getByRole('navigation')).toBeInTheDocument();
});
```

**Gate:** Before asserting on mock elements, ask "Am I testing real behavior or just mock existence?"

## Anti-Pattern 2: Test-Only Methods in Production

```typescript
// BAD: destroy() only used in tests
class Session {
  async destroy() {  // Pollutes production class
    await this._workspaceManager?.destroyWorkspace(this.id);
  }
}

// GOOD: Test utilities handle test cleanup
// In test-utils/
export async function cleanupSession(session: Session) {
  const workspace = session.getWorkspaceInfo();
  if (workspace) {
    await workspaceManager.destroyWorkspace(workspace.id);
  }
}
```

**Gate:** Before adding method to production class, ask "Is this only used by tests?" If yes, put it in test utilities.

## Anti-Pattern 3: Mocking Without Understanding

```typescript
// BAD: Mock breaks test logic
vi.mock('ToolCatalog', () => ({
  discoverAndCacheTools: vi.fn().mockResolvedValue(undefined)
}));
// Mocked method had side effect test depended on!

// GOOD: Mock at correct level
vi.mock('MCPServerManager'); // Just mock slow server startup
// Preserve behavior test needs
```

**Gate:** Before mocking, understand what side effects the real method has and whether your test depends on them.

## Anti-Pattern 4: Incomplete Mocks

```typescript
// BAD: Partial mock - only fields you think you need
const mockResponse = {
  status: 'success',
  data: { userId: '123' }
  // Missing: metadata that downstream code uses
};

// GOOD: Mirror real API completely
const mockResponse = {
  status: 'success',
  data: { userId: '123', name: 'Alice' },
  metadata: { requestId: 'req-789', timestamp: 1234567890 }
};
```

**Iron Rule:** Mock the COMPLETE data structure as it exists in reality.

## Quick Reference

| Anti-Pattern | Fix |
|--------------|-----|
| Assert on mock elements | Test real component or unmock it |
| Test-only methods in production | Move to test utilities |
| Mock without understanding | Understand dependencies first, mock minimally |
| Incomplete mocks | Mirror real API completely |
| Over-complex mocks | Consider integration tests |

## Red Flags

- Assertion checks for `*-mock` test IDs
- Methods only called in test files
- Mock setup is >50% of test
- Test fails when you remove mock
- Can't explain why mock is needed
- Mocking "just to be safe"

## The Bottom Line

**Mocks are tools to isolate, not things to test.**

If you're testing mock behavior, you've gone wrong.
