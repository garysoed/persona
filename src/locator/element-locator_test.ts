import 'jasmine';

import { assert } from 'gs-testing/export/main';
import { should } from 'gs-testing/src/main/run';
import { ElementWithTagType } from 'gs-types/export';
import { element } from './element-locator';
import { resolveLocators } from './resolve';

describe('locator.element', () => {
  should(`resolve correctly`, () => {
    const root = {
      a: element('b.c'),
      b: {
        c: element('c', ElementWithTagType('div')),
      },
    };

    const resolved = resolveLocators(root);
    assert(resolved.a).to.be(root.b.c);
  });
});
