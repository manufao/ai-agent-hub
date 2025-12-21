# 🧪 Vitest Unit Test Agent

Specialized agent for creating comprehensive unit tests for Svelte 5 applications with Vitest and Testing Library.

## 🎯 Objective

Create high-quality unit tests achieving **100% code coverage** while following best practices and established project patterns.

## 🚀 How to Use

### Agent Invocation

Use this agent when you need to:

- Create tests for a new Svelte component
- Test a utility function
- Improve coverage of existing tests
- Refactor tests to follow project patterns

### Example Prompt

```
Create comprehensive unit tests for the Button.svelte component
```

### Slash Command

```bash
/ut src/lib/components/Button.svelte
/ut @Button.svelte
/ut calculateAverage
```

## 📋 Agent Workflow

The agent automatically follows this process:

1. **Analysis**: Reads the component/file to test
2. **Creation**: Generates tests following established patterns
3. **Formatting**: Runs `npm run format`
4. **Verification**: Runs tests with `npm test`
5. **Coverage**: Checks coverage with `npm run test:coverage`
6. **Full Validation** ⚠️ **MANDATORY**: Runs all tests with `npm test -- --run`
7. **Report**: Provides detailed results report

## ✨ Applied Patterns

### Test Structure

```typescript
describe('Component', () => {
    // Shared test data
    const mockData = { ... };
    let mockCallback: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        mockCallback = vi.fn();
    });

    describe('Rendering', () => {
        it('should render with props', () => { ... });
    });

    describe('Interactions', () => {
        it('should handle user action', async () => { ... });
    });
});
```

### Svelte 5 Component Rendering

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
render(Component as any, { props });
```

### BDD Pattern (Given/When/Then)

```typescript
it('should update on click', async () => {
	// Given: Initial state
	// When: User action
	// Then: Expected result
});
```

## 📊 Success Criteria

- ✅ All tests pass
- ✅ Coverage = 100% (Statements, Branches, Functions, Lines)
- ✅ Code properly formatted
- ✅ Patterns consistent with project
- ✅ No redundant tests
- ✅ No existing tests broken (full validation)

## 🔧 Commands Used

```bash
# Formatting
npm run format

# Tests
npm test -- ComponentName.test.ts --run

# Coverage
npm run test:coverage -- ComponentName.test.ts --run

# Full suite
npm test -- --run
```

## 📝 Test Types Created

### 1. Rendering Tests

- Required and optional props
- Conditional states
- List rendering
- Dynamic styles

### 2. Interaction Tests

- Button clicks
- Form input
- Form submission
- Navigation

### 3. Edge Case Tests

- Error validation
- Empty states
- Boundary values
- Error cases

### 4. Store Tests

- Svelte store mocking
- Update verification
- Data reactivity

## 🎨 Preferred Selectors

In order of preference:

1. **Role**: `getByRole('button', { name: /submit/i })`
2. **Label**: `getByLabelText(/username/i)`
3. **Text**: `getByText(/welcome/i)`
4. **TestId**: `getByTestId('custom')` (last resort)

## ⚠️ Common Pitfalls Avoided

- ❌ Testing default behaviors
- ❌ Testing framework internals
- ❌ Redundant tests
- ❌ Mocking already-tested values without mocks
- ❌ Fragile selectors (index, CSS classes)

## 📈 Output Report

The agent provides a structured report:

```
## Test Results for ComponentName

### ✅ Step 1: Code Formatting
- Status: Passed

### ✅ Step 2: Test Execution
- Status: All tests passed (15 tests)

### ✅ Step 3: Coverage Verification
- Statements: 100%
- Branches: 100%
- Functions: 100%
- Lines: 100%

### ✅ Step 4: Full Suite Check
- Status: All tests passed (134 tests total)

### 📊 Test Statistics
- Total tests: 15
- Rendering tests: 7
- Interaction tests: 6
- Edge case tests: 2
```

## 🔗 CI/CD Integration

Tests created by this agent are ready for:

- Continuous Integration (CI)
- Pre-commit hooks
- Pull request validation
- Automated deployment

## 💡 Tips

- Agent uses **actual rendered text** (not i18n keys)
- Mocks are **systematically** created in `beforeEach()`
- Tests follow **TDD philosophy**
- Focus on **user behavior**, not implementation

## 📚 Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/svelte-testing-library/intro/)
- [Svelte Testing Best Practices](https://testing-library.com/docs/svelte-testing-library/setup/)

---

**Version**: 1.0.0
**Last Updated**: December 2024
**Maintenance**: Update this README if test patterns evolve
