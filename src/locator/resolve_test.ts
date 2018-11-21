import { assert, match, should, test } from 'gs-testing/export/main';
import { ElementWithTagType } from 'gs-types/export';
import { element } from './element-locator';
import { resolveLocators } from './resolve';

test('locator.resolveSelectors', () => {
  should(`resolve the object correctly`, () => {
    const unresolved = {
      a: element('b.c'),
      b: {
        c: element('c', ElementWithTagType('div')),
      },
    };

    assert(resolveLocators(unresolved)).to.haveProperties({
      a: unresolved.b.c,
      b: match.anyObjectThat().haveProperties({
        c: unresolved.b.c,
      }),
    });
  });

  should(`throw error if an unresolved spec refers to the wrong type`, () => {
    const unresolved = {
      a: element('b'),
      b: element('c'),
    };

    assert(() => {
      resolveLocators(unresolved);
    }).to.throwErrorWithMessage(/Type of b/i);
  });
});
