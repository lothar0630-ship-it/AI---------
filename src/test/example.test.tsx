import { describe, it, expect } from 'vitest';
import { render, screen } from './utils';

// Simple test component for verification
const TestComponent = () => {
  return <div>Hello Test World</div>;
};

describe('Test Environment Setup', () => {
  it('should render a simple component', () => {
    render(<TestComponent />);
    expect(screen.getByText('Hello Test World')).toBeInTheDocument();
  });

  it('should have access to testing utilities', () => {
    expect(screen).toBeDefined();
    expect(render).toBeDefined();
  });

  it('should have jest-dom matchers available', () => {
    const element = document.createElement('div');
    element.textContent = 'test';
    expect(element).toBeInTheDocument;
  });
});
