# Detailed patterns — Vitest Unit Test Agent

Reference material for [`.agents/vitest-unit-test.md`](../../../.agents/vitest-unit-test.md). Loaded only when the agent needs it — not part of the canonical persona itself.

> Originally written for Svelte 5 components + Testing Library. This project is plain Node/TypeScript (no server-side UI components): keep the test structure and principles (shared data, Given/When/Then, mocks) and adapt rendering/selectors to what actually exists in the file under test.

## Expected test structure

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('ModuleName', () => {
  // Shared test data at the top of the describe block
  const mockData = { basic: { id: '1', name: 'Test' } }
  let mockCallback: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockCallback = vi.fn()
  })

  describe('Nominal case', () => {
    it('should ... when ...', () => {
      // Given: initial state
      // When: action
      // Then: expected result
    })
  })
})
```

## Sharing rules

- Shared test data at the top of the `describe`, no needless intermediate variables
- Mocks created in `beforeEach()`, reset with `vi.clearAllMocks()`
- Mock only dependencies already tested elsewhere (`vi.mock('$lib/utils', ...)`), never the logic under test

## BDD pattern (Given/When/Then)

```typescript
it('should increment the counter on click', async () => {
  // Given: initial state
  const user = userEvent.setup()

  // When: the user clicks
  await user.click(button)

  // Then: the state is updated
  expect(result).toBe(1)
})
```

## Selector priority (UI/DOM context)

1. Role: `getByRole('button', { name: /submit/i })`
2. Label: `getByLabelText(/username/i)`
3. Text: `getByText(/welcome/i)`
4. Test ID (last resort): `getByTestId('custom-element')`

## i18n

Never mock i18n functions or use translation keys in assertions — use the text actually rendered. This naturally covers i18n branches and catches integration regressions.

## Dynamic import policy

```typescript
// ❌ Forbidden: dynamic import inside a test or a beforeEach
beforeEach(async () => {
  const module = await import('./theme.svelte')
})

// ✅ Allowed: explicit top-level helper
async function createFreshStore() {
  vi.resetModules()
  const module = await import('./theme.svelte')
  return module.createStore()
}
```

## Common failures

| Symptom | Likely cause | Fix |
|---|---|---|
| Selector not found | Translation key instead of real text | Inspect the render, use the displayed text |
| Flaky test on an interaction | Missing `await` on `user.click()`/`user.type()` | Always `await` interactions |
| Mock returns the wrong type | Mocked function's signature not checked | Check the real signature before mocking |
| Several elements match | Selector too broad | Narrow by accessible name or role |

## Expected output report

```markdown
## Test results for <ModuleName>

### ✅ Step 1: Formatting — Passed
### ✅ Step 2: Test run — X tests passed
### ✅ Step 3: Coverage — Statements 100%, Branches 100%, Functions 100%, Lines 100%
### ✅ Step 4: Full suite — No regressions

### 📊 Statistics: X tests (Y rendering, Z interactions, W edge cases)
```
