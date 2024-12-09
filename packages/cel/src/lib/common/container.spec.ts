import { Container } from './container';

describe('Container', () => {
  it('resolveCandidateNames', () => {
    const container = new Container('a.b.c.M.N', new Map());
    expect(container.resolveCandidateNames('R.s')).toEqual([
      'a.b.c.M.N.R.s',
      'a.b.c.M.R.s',
      'a.b.c.R.s',
      'a.b.R.s',
      'a.R.s',
      'R.s',
    ]);
  });

  it('addAbbrevs', () => {
    let container = new Container();
    container.addAbbrevs('my.alias.R');
    expect(container.resolveCandidateNames('R')).toEqual(['my.alias.R']);
    container = new Container('a.b.c');
    container.addAbbrevs('my.alias.R');
    expect(container.resolveCandidateNames('R.S.T')).toEqual([
      'my.alias.R.S.T',
    ]);
    expect(container.resolveCandidateNames('S')).toEqual([
      'a.b.c.S',
      'a.b.S',
      'a.S',
      'S',
    ]);
  });
});
