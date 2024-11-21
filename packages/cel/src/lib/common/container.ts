import { isNil } from '@bearclaw/is';

/**
 * Holds a reference to an optional qualified container name and set of aliases.
 *
 * The program container can be used to simplify variable, function, and type
 * specification within CEL programs and behaves more or less like a C++
 * namespace. See resolveCandidateNames for more details.
 */
export class Container {
  constructor(
    public readonly name = '',
    public readonly aliases = new Map<string, string>()
  ) {}

  /**
   * Extends the current container with another name or additional aliases.
   *
   * @param name the name of the container
   * @param aliases the aliases to add to the container
   * @returns a new container with the extended name and aliases
   */
  extend(name: string, aliases: Map<string, string>) {
    const newAliases = new Map(this.aliases);
    for (const [key, value] of aliases) {
      newAliases.set(key, value);
    }
    return new Container(name, newAliases);
  }

  /**
   * Returns the candidates name of namespaced identifiers in C++ resolution
   * order.
   *
   * Names which shadow other names are returned first. If a name includes
   * leading dot ('.'), the name is treated as an absolute identifier which
   * cannot be shadowed.
   *
   * Given a container name a.b.c.M.N and a type name R.s, this will deliver in
   * order:
   *
   * a.b.c.M.N.R.s
   * a.b.c.M.R.s
   * a.b.c.R.s
   * a.b.R.s
   * a.R.s
   * R.s
   *
   * If aliases or abbreviations are configured for the container, then alias
   * names will take precedence over containerized names.
   *
   * @param name the candidate name to resolve
   */
  resolveCandidateNames(name: string): string[] {
    if (name.startsWith('.')) {
      const qn = name.substring(1);
      const alias = this.findAlias(qn);
      if (!isNil(alias)) {
        return [alias];
      }
      return [qn];
    }
    const alias = this.findAlias(name);
    if (alias !== '') {
      return [alias];
    }
    if (name === '') {
      return [];
    }
    let nextCont = this.name;
    const candidates = [`${nextCont}.${name}`];
    for (
      let i = nextCont.lastIndexOf('.');
      i > -1;
      i = nextCont.lastIndexOf('.')
    ) {
      nextCont = nextCont.substring(0, i);
      candidates.push(`${nextCont}.${name}`);
    }
    return [...candidates, name];
  }

  /**
   * Takes a name as input and returns an alias expansion if one exists.
   *
   * If the name is qualified, the first component of the qualified name is
   * checked against known aliases. Any alias that is found in a qualified name
   * is expanded in the result:
   *
   * alias: R -> my.alias.R
   * name: R.S.T
   * output: my.alias.R.S.T
   *
   * Note, the name must not have a leading dot.
   *
   * @param name the name to find an alias for
   * @returns the alias if one exists, otherwise an empty string
   */
  findAlias(name: string) {
    // If an alias exists for the name, ensure it is searched last.
    let simple = name;
    let qualifier = '';
    const dot = name.indexOf('.');
    if (dot > -1) {
      simple = name.substring(0, dot);
      qualifier = name.substring(dot);
    }
    const alias = this.aliases.get(simple);
    if (isNil(alias)) {
      return '';
    }
    return alias + qualifier;
  }
}
