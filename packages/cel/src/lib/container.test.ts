import { CELContainer } from './container';

describe('CELContainer', () => {
  it('resolveCandidateNames', () => {
    const container = new CELContainer('a.b.c.M.N', new Map());
    expect(container.resolveCandidateNames('R.s')).toEqual([
      'a.b.c.M.N.R.s',
      'a.b.c.M.R.s',
      'a.b.c.R.s',
      'a.b.R.s',
      'a.R.s',
      'R.s',
    ]);
  });
});
