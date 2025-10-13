# Testing Setup

This directory contains the testing configuration and utilities for the Personal Portal project.

## Testing Stack

- **Vitest**: Fast unit test framework built on Vite
- **React Testing Library**: Simple and complete testing utilities for React components
- **Happy DOM**: Lightweight DOM implementation for testing
- **@testing-library/jest-dom**: Custom jest matchers for DOM elements

## Files

- `setup.ts`: Test environment setup and global mocks
- `utils.tsx`: Custom render function with providers
- `mocks.ts`: Mock data and API responses for testing
- `example.test.tsx`: Example test to verify setup

## Running Tests

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Basic Component Test

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '../test/utils';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});
```

### Testing with React Query

The custom render function in `utils.tsx` automatically wraps components with QueryClientProvider, so you can test components that use React Query hooks without additional setup.

### Mocking APIs

Use the mock data from `mocks.ts` or create your own:

```tsx
import { vi } from 'vitest';
import { mockYouTubeApiResponse } from '../test/mocks';

// Mock fetch
global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => mockYouTubeApiResponse,
});
```

## Available Matchers

Thanks to `@testing-library/jest-dom`, you have access to additional matchers:

- `toBeInTheDocument()`
- `toHaveClass()`
- `toHaveAttribute()`
- `toBeVisible()`
- And many more...

## Global Mocks

The following are automatically mocked in the test environment:

- `IntersectionObserver`
- `ResizeObserver`
- `matchMedia`
- `fetch`
