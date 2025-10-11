# Testing Setup

This project uses **Vitest** as the testing framework with **React Testing Library** for component testing.

## 📁 Test Structure

```
src/
├── test/
│   ├── setup.ts          # Global test setup and configuration
│   ├── testUtils.tsx     # Custom render helpers and utilities
│   └── README.md         # This file
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx
├── utils/
│   ├── utility.ts
│   └── utility.test.ts
└── store/
    ├── store.ts
    └── store.test.ts
```

## 🚀 Running Tests

### Watch Mode (Development)

```bash
npm test
# or
npm run test
```

Runs tests in watch mode. Tests automatically re-run when files change.

### Run Once (CI/CD)

```bash
npm run test:run
```

Runs all tests once and exits.

### UI Mode

```bash
npm run test:ui
```

Opens an interactive UI to view and run tests in the browser.

### Coverage Report

```bash
npm run test:coverage
```

Generates a coverage report showing which code is tested.

## 📝 Writing Tests

### Utility Function Tests

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './myUtility';

describe('myFunction', () => {
  it('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected output');
  });
});
```

### Component Tests

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/testUtils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Store Tests (Zustand)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { useMyStore } from './myStore';

describe('myStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useMyStore.setState({
      /* initial state */
    });
  });

  it('should update state', () => {
    const { myAction } = useMyStore.getState();
    myAction('value');

    const state = useMyStore.getState();
    expect(state.myValue).toBe('value');
  });
});
```

## 🛠️ Testing Utilities

### Custom Render

The `render` function from `testUtils.tsx` wraps components with necessary providers (Router, etc.):

```typescript
import { render, screen } from '../test/testUtils';

render(<MyComponent />);
```

### Available Matchers

From `@testing-library/jest-dom`:

- `toBeInTheDocument()`
- `toHaveClass()`
- `toHaveStyle()`
- `toBeVisible()`
- `toBeDisabled()`
- And many more...

### Mock Functions

```typescript
import { vi } from 'vitest';

const mockFn = vi.fn();
mockFn('arg');
expect(mockFn).toHaveBeenCalledWith('arg');
```

### Timers

```typescript
import { vi, beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test('timer test', () => {
  // ... code that uses setTimeout
  vi.advanceTimersByTime(1000);
  // ... assertions
});
```

## 📊 Coverage Configuration

Coverage is configured to exclude:

- `node_modules/`
- `src/test/`
- Type definition files (`**/*.d.ts`)
- Config files (`**/*.config.*`)
- Documentation (`docs/`)

Coverage reports are generated in `coverage/` directory.

## 🔧 Configuration

Vitest is configured in `vite.config.ts`:

```typescript
test: {
  globals: true,           // Use global test functions
  environment: 'happy-dom', // DOM environment for React testing
  setupFiles: './src/test/setup.ts',
  css: true,              // Process CSS imports
  coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
  },
}
```

## 📚 Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what users see and do
   - Avoid testing internal state directly

2. **Use Descriptive Test Names**
   - `it('should display error when form is invalid')`
   - Not: `it('test 1')`

3. **Keep Tests Independent**
   - Each test should work in isolation
   - Use `beforeEach` to reset state

4. **Mock External Dependencies**
   - Mock API calls, timers, and external services
   - Keep tests fast and deterministic

5. **Test Edge Cases**
   - Empty states
   - Error conditions
   - Boundary values

## 🐛 Debugging Tests

### Run a Single Test File

```bash
npm test src/components/MyComponent.test.tsx
```

### Run Tests Matching a Pattern

```bash
npm test -- -t "should render"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "runtimeExecutable": "npm",
  "runtimeArgs": ["run", "test:run"],
  "console": "integratedTerminal"
}
```

## 📦 Dependencies

- `vitest` - Test framework
- `@testing-library/react` - React component testing utilities
- `@testing-library/jest-dom` - Custom matchers
- `@testing-library/user-event` - User interaction simulation
- `@vitest/ui` - Interactive test UI
- `happy-dom` - Lightweight DOM implementation

## 🎯 Current Test Coverage

Run `npm run test:coverage` to see current coverage metrics.

Goal: Maintain >80% coverage on critical paths.
