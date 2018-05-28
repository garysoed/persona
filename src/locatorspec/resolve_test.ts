import { assert } from 'gs-testing/export/main';
import { fshould } from 'gs-testing/src/main/run';
import { ElementWithTagType } from 'gs-types/export';
import { elementSelector } from './element-spec';
import { resolveSelectors } from './resolve';

describe('locatorspec.resolveSelectors', () => {
  fshould(`resolve the object correctly`, () => {
    const unresolved = {
      a: elementSelector('b.c'),
      b: {
        c: elementSelector('c', ElementWithTagType('div')),
      },
    };

    assert(resolveSelectors(unresolved)).to.equal({
      a: unresolved.b.c,
      b: {
        c: unresolved.b.c,
      },
    });
  });

  fshould(`throw error if an unresolved spec refers to the wrong type`, () => {
    const unresolved = {
      a: elementSelector('b'),
      b: elementSelector('c'),
    };

    assert(() => {
      resolveSelectors(unresolved);
    }).to.throwError(/Type of b/i);
  });
});
