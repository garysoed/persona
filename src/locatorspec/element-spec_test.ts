import 'jasmine';

import { assert } from 'gs-testing/export/main';
import { should } from 'gs-testing/src/main/run';
import { ElementWithTagType } from 'gs-types/export';
import { elementSelector } from './element-spec';
import { resolveSelectors } from './resolve';

describe('locatorspec.ElementSpec', () => {
  should(`resolve correctly`, () => {
    const root = {
      a: elementSelector('b.c'),
      b: {
        c: elementSelector('c', ElementWithTagType('div')),
      },
    };

    const resolved = resolveSelectors(root);
    assert(resolved.a).to.be(root.b.c);
  });
});
