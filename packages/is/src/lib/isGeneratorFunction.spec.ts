import { isGeneratorFunction } from './isGeneratorFunction';
import { testValues } from './test-utils.spec';

describe('isGeneratorFunction', () => {
  it('should be a function', () => {
    expect(typeof isGeneratorFunction).toEqual('function');
  });

  testValues(isGeneratorFunction, ['generatorFunction']);
});
