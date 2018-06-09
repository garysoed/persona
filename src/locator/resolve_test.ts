import { assert } from 'gs-testing/export/main';
import { should } from 'gs-testing/src/main/run';
import { ElementWithTagType } from 'gs-types/export';
import { element } from './element-locator';
import { resolveLocators } from './resolve';

describe('locator.resolveSelectors', () => {
  should(`resolve the object correctly`, () => {
    const unresolved = {
      a: element('b.c'),
      b: {
        c: element('c', ElementWithTagType('div')),
      },
    };

    assert(resolveLocators(unresolved)).to.equal({
      a: unresolved.b.c,
      b: {
        c: unresolved.b.c,
      },
    });
  });

  should(`throw error if an unresolved spec refers to the wrong type`, () => {
    const unresolved = {
      a: element('b'),
      b: element('c'),
    };

    assert(() => {
      resolveLocators(unresolved);
    }).to.throwError(/Type of b/i);
  });
});
