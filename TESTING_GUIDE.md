# Vitest Testing Setup - Complete Guide

## 🎉 Setup Complete!

Your project now has a fully configured testing environment using **Vitest** - a blazingly fast alternative to Jest.

---

## 📊 Current Test Status

```
✓ 45 tests passing
✓ 4 test suites passing
✓ 100% coverage on tested utilities
✓ 98.51% coverage on Zustand store
```

### Test Files Created:

1. **`src/utils/obfuscation.test.ts`** - 15 tests for text obfuscation utilities
2. **`src/components/Task.util.test.ts`** - 4 tests for task utilities
3. **`src/components/ProgressBar.test.tsx`** - 9 tests for ProgressBar component
4. **`src/store/kanbanStore.test.ts`** - 17 tests for Zustand store operations

---

## 🚀 Quick Start

### Run Tests in Watch Mode

```bash
npm test
```

Tests automatically re-run when you save files. Perfect for TDD!

### Run All Tests Once

```bash
npm run test:run
```

Ideal for CI/CD pipelines.

### Open Interactive UI

```bash
npm run test:ui
```

Beautiful browser-based UI to explore and run tests.

### Generate Coverage Report

```bash
npm run test:coverage
```

See which code is tested and which needs more coverage.

---

## 📦 What Was Installed

### Core Testing Libraries

- **vitest** `^3.2.4` - Test framework (Jest alternative)
- **@vitest/ui** - Interactive test interface
- **@vitest/coverage-v8** - Code coverage reporting
- **happy-dom** - Fast DOM implementation (lighter than jsdom)

### React Testing Libraries

- **@testing-library/react** - React component testing utilities
- **@testing-library/jest-dom** - Custom matchers like `toBeInTheDocument()`
- **@testing-library/user-event** - Simulate user interactions

---

## ⚙️ Configuration

### `vite.config.ts`

Vitest shares your Vite configuration, so tests use the same transforms, aliases, and plugins as your app.

```typescript
test: {
  globals: true,              // Use describe, it, expect globally
  environment: 'happy-dom',   // Fast DOM implementation
  setupFiles: './src/test/setup.ts',
  css: true,                  // Process CSS imports in tests
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
  },
}
```

### `src/test/setup.ts`

Global test setup that runs before each test file:

- Configures jest-dom matchers
- Mocks `window.matchMedia`
- Polyfills `crypto.randomUUID`
- Auto-cleanup after each test

### `src/test/testUtils.tsx`

Custom render helper that wraps components with providers (Router, etc.)

---

## 🎯 Why Vitest Over Jest?

| Feature              | Vitest ⚡          | Jest 🐢            |
| -------------------- | ------------------ | ------------------ |
| **Speed**            | 10x faster         | Slower             |
| **Vite Integration** | ✅ Native          | ❌ Requires config |
| **ESM Support**      | ✅ Native          | 🟡 Experimental    |
| **Watch Mode**       | ✅ HMR             | ✅ Standard        |
| **Config**           | Shares vite.config | Separate config    |
| **Bundle Size**      | Smaller            | Larger             |
| **API**              | Jest-compatible    | Jest               |

### Key Advantages:

1. **Speed**: Tests run 10x faster than Jest
2. **Zero Config**: Shares your Vite config
3. **HMR**: Instant test updates (like dev server)
4. **Modern**: Built for ESM, TypeScript, and modern frameworks
5. **Compatible**: Drop-in replacement for Jest API

---

## 📝 Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature', () => {
  it('should do something', () => {
    expect(true).toBe(true);
  });
});
```

### Component Test Example

```typescript
import { render, screen } from '../test/testUtils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders greeting', () => {
    render(<MyComponent name="World" />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);

    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Store Test Example (Zustand)

```typescript
import { useMyStore } from './myStore';

describe('myStore', () => {
  beforeEach(() => {
    useMyStore.setState({ count: 0 });
  });

  it('increments count', () => {
    const { increment } = useMyStore.getState();
    increment();
    expect(useMyStore.getState().count).toBe(1);
  });
});
```

---

## 🛠️ Common Testing Patterns

### Mock Functions

```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();
mockFn('arg');
expect(mockFn).toHaveBeenCalledWith('arg');
```

### Timers

```typescript
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

test('delays', () => {
  setTimeout(() => {}, 1000);
  vi.advanceTimersByTime(1000);
});
```

### Async Testing

```typescript
it('fetches data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});
```

### User Events

```typescript
import userEvent from '@testing-library/user-event';

it('handles input', async () => {
  render(<Input />);
  const input = screen.getByRole('textbox');
  await userEvent.type(input, 'Hello');
  expect(input).toHaveValue('Hello');
});
```

---

## 📊 Coverage Reports

After running `npm run test:coverage`, you'll see:

```
% Coverage report from v8
-------------------|---------|----------|---------|---------|-------------------
File               | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------------|---------|----------|---------|---------|-------------------
ProgressBar.tsx    |     100 |      100 |     100 |     100 |
obfuscation.ts     |     100 |      100 |     100 |     100 |
kanbanStore.ts     |   98.51 |    87.75 |     100 |   98.51 | 215-216,248-249
```

Coverage HTML report: `coverage/index.html`

---

## 🎨 UI Mode

Run `npm run test:ui` and open your browser to see:

- 📊 Interactive test results
- 🔍 Filter by file, test name, or status
- 📈 Real-time coverage visualization
- 🐛 Detailed error messages with stack traces
- ⏱️ Performance metrics per test

---

## 🐛 Debugging

### Run Single Test File

```bash
npm test src/components/MyComponent.test.tsx
```

### Run Tests Matching Pattern

```bash
npm test -- -t "should render"
```

### Verbose Output

```bash
npm test -- --reporter=verbose
```

### Watch Single File

```bash
npm test src/utils/myUtil.test.ts
```

---

## 📚 Best Practices

1. **Test User Behavior, Not Implementation**

   ```typescript
   // ✅ Good
   expect(screen.getByText('Submit')).toBeInTheDocument();

   // ❌ Bad
   expect(component.state.isSubmitting).toBe(false);
   ```

2. **Use Descriptive Names**

   ```typescript
   // ✅ Good
   it('should show error when email is invalid');

   // ❌ Bad
   it('test 1');
   ```

3. **Keep Tests Independent**

   ```typescript
   // Use beforeEach to reset state
   beforeEach(() => {
     useStore.setState(initialState);
   });
   ```

4. **Mock External Dependencies**

   ```typescript
   vi.mock('./api', () => ({
     fetchData: vi.fn(() => Promise.resolve({ data: 'mock' })),
   }));
   ```

5. **Test Edge Cases**
   - Empty arrays
   - Null/undefined values
   - Error conditions
   - Loading states

---

## 🎓 Learn More

### Official Documentation

- [Vitest Docs](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [jest-dom Matchers](https://github.com/testing-library/jest-dom)

### Example Test Patterns in This Project

- **Utility Functions**: `src/utils/obfuscation.test.ts`
- **React Components**: `src/components/ProgressBar.test.tsx`
- **Zustand Store**: `src/store/kanbanStore.test.ts`
- **DOM Utilities**: `src/components/Task.util.test.ts`

---

## 🔥 Next Steps

1. **Add More Component Tests**
   - Test `Task.tsx` component interactions
   - Test `BucketView.tsx` rendering
   - Test `Board.tsx` integration

2. **Integration Tests**
   - Test complete user flows
   - Test bucket creation and authentication
   - Test task drag-and-drop

3. **E2E Tests** (Optional)
   - Consider Playwright for full E2E testing
   - Test critical user journeys

4. **CI/CD Integration**

   ```yaml
   # .github/workflows/test.yml
   - name: Run tests
     run: npm run test:run

   - name: Generate coverage
     run: npm run test:coverage
   ```

5. **Coverage Goals**
   - Aim for >80% coverage on critical code
   - 100% on utility functions
   - Focus on user-facing features

---

## 🎯 Test Coverage Goals

| Module     | Current  | Target |
| ---------- | -------- | ------ |
| Utils      | 100% ✅  | 100%   |
| Store      | 98.5% ✅ | 100%   |
| Components | 7.5%     | 80%    |
| Overall    | 29.5%    | 80%    |

---

## 📞 Troubleshooting

### Tests Failing After Dependency Update

```bash
rm -rf node_modules package-lock.json
npm install
```

### Coverage Not Generating

```bash
npm install -D @vitest/coverage-v8
```

### DOM Elements Not Found

- Use `screen.debug()` to see rendered HTML
- Check if component actually renders the element
- Verify queries (use Testing Library Playground)

### Async Tests Timing Out

```typescript
it('async test', async () => {
  // Use waitFor for async updates
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
}, 10000); // Increase timeout if needed
```

---

## 🎉 Summary

You now have a modern, fast testing setup with:

- ✅ 45 passing tests across 4 test suites
- ✅ Coverage reporting
- ✅ Interactive UI mode
- ✅ Jest-compatible API
- ✅ 10x faster than Jest
- ✅ Zero configuration (shares Vite config)

Happy testing! 🚀
