const add = (a: number, b: number) => {
  return a + b;
};

describe('main process logic', () => {
  it('should add two numbers correctly', () => {
    expect(add(1, 2)).toBe(3);
  });
});