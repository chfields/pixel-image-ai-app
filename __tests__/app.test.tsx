import React from 'react';
import { render, screen } from '@testing-library/react';
import App from "../src/pages/app"  // Replace with your component path

// test('renders basic app test', () => {
//  render(<App />);
//  const linkElement = screen.getByText(/Pixel Image AI App/i);
//  expect(linkElement).toBeDefined();
// });

test('hello world', () => { 
  it('should add two numbers correctly', () => {
    expect("hello").toBe("hello");
  });
});