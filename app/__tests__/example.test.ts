describe('Basic Tests', () => {
  it('True should be true', () => {
    expect(true).toBe(true);
  });

  it('Math operations should work', () => {
    expect(1 + 1).toBe(2);
    expect(5 * 5).toBe(25);
    expect(10 - 5).toBe(5);
  });

  it('Strings should concatenate', () => {
    expect('Hello ' + 'World').toBe('Hello World');
  });
});
