import 'jasmine';

import { assert, should, test } from 'gs-testing/export/main';
import { ElementWithTagType } from 'gs-types/export';
import { element } from './element-locator';
import { resolveLocators } from './resolve';

test('locator.element', () => {
  should(`resolve correctly`, () => {
    const root = {
      a: element('b.c'),
      b: {
        c: element('c', ElementWithTagType('div')),
      },
    };

    const resolved = resolveLocators(root);
    assert(resolved.a).to.equal(root.b.c);
  });
});
