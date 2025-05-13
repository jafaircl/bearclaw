import { isNil } from '@bearclaw/is';
import { abbrevs, alias, Container, ContainerOption, name } from './container';

describe('Container', () => {
  it('TestContainers_ResolveCandidateNames', () => {
    const container = new Container(name('a.b.c.M.N'));
    expect(container.resolveCandidateNames('R.s')).toEqual([
      'a.b.c.M.N.R.s',
      'a.b.c.M.R.s',
      'a.b.c.R.s',
      'a.b.R.s',
      'a.R.s',
      'R.s',
    ]);
  });

  it('TestContainers_ResolveCandidateNames_FullyQualifiedName', () => {
    const c = new Container(name('a.b.c.M.N'));
    // The leading '.' indicates the name is already fully-qualified.
    const names = c.resolveCandidateNames('.R.s');
    expect(names).toEqual(['R.s']);
  });

  it('TestContainers_ResolveCandidateNames_EmptyContainer', () => {
    const c = new Container();
    const names = c.resolveCandidateNames('R.s');
    expect(names).toEqual(['R.s']);
  });

  it('TestContainers_Abbrevs', () => {
    const abbr = new Container().extend(abbrevs('my.alias.R'));
    let names = abbr.resolveCandidateNames('R');
    expect(names).toEqual(['my.alias.R']);

    const c = new Container(name('a.b.c'), abbrevs('my.alias.R'));
    names = c.resolveCandidateNames('R');
    expect(names).toEqual(['my.alias.R']);

    names = c.resolveCandidateNames('R.S.T');
    expect(names).toEqual(['my.alias.R.S.T']);

    names = c.resolveCandidateNames('S');
    expect(names).toEqual(['a.b.c.S', 'a.b.S', 'a.S', 'S']);
  });

  describe('TestContainers_Aliasing_Errors', () => {
    interface AliasDef {
      name: string;
      alias: string;
    }
    interface TestCase {
      container?: string;
      abbrevs?: string[];
      aliases?: AliasDef[];
      err: string;
    }
    const tests: TestCase[] = [
      {
        abbrevs: ['my.alias.R', 'yer.other.R'],
        err: 'abbreviation collides with existing reference: name=yer.other.R, abbreviation=R, existing=my.alias.R',
      },
      {
        container: 'a.b.c.M.N',
        abbrevs: ['my.alias.a', 'yer.other.b'],
        err: 'abbreviation collides with container name: name=my.alias.a, abbreviation=a, container=a.b.c.M.N',
      },
      {
        abbrevs: ['.bad'],
        err: "invalid qualified name: .bad, wanted name of the form 'qualified.name'",
      },
      {
        abbrevs: ['bad.alias.'],
        err: "invalid qualified name: bad.alias., wanted name of the form 'qualified.name'",
      },
      {
        abbrevs: ['   bad_alias1'],
        err: "invalid qualified name: bad_alias1, wanted name of the form 'qualified.name'",
      },
      {
        abbrevs: ['   bad.alias!  '],
        err: "invalid qualified name: bad.alias!, wanted name of the form 'qualified.name'",
      },
      {
        aliases: [{ name: 'a', alias: 'b' }],
        err: 'alias must refer to a valid qualified name: a',
      },
      {
        aliases: [{ name: 'my.alias', alias: 'b.c' }],
        err: 'alias must be non-empty and simple (not qualified): alias=b.c',
      },
      {
        aliases: [{ name: '.my.qual.name', alias: "a'" }],
        err: "qualified name must not begin with a leading '.': .my.qual.name",
      },
    ];
    for (const tc of tests) {
      it(`TestContainers_Aliasing_Errors_${tc.err}`, () => {
        const opts: ContainerOption[] = [];
        if (!isNil(tc.container)) {
          opts.push(name(tc.container));
        }
        if (!isNil(tc.abbrevs) && tc.abbrevs.length !== 0) {
          opts.push(abbrevs(...tc.abbrevs));
        }
        if (!isNil(tc.aliases) && tc.aliases.length !== 0) {
          for (const a of tc.aliases) {
            opts.push(alias(a.name, a.alias));
          }
        }
        expect(() => {
          new Container(...opts);
        }).toThrowError(tc.err);
      });
    }
  });

  it('TestContainers_Extend_Alias', () => {
    let c = new Container().extend(alias('test.alias', 'alias'));
    expect(c.aliasSet().get('alias')).toEqual('test.alias');

    c = c.extend(name('with.container'));
    expect(c.name).toEqual('with.container');
    expect(c.aliasSet().get('alias')).toEqual('test.alias');
  });

  it('TestContainers_Extend_Name', () => {
    let c = new Container().extend(name(''));
    expect(c.name).toEqual('');

    c = new Container().extend(name('hello.container'));
    expect(c.name).toEqual('hello.container');

    c = c.extend(name('goodbye.container'));
    expect(c.name).toEqual('goodbye.container');

    expect(() => {
      c = c.extend(name('.bad.container'));
    }).toThrow();
  });
});
