import { instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { assert, should, wait } from 'gs-testing/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { ElementWithTagType, NullType, UnionType } from 'gs-types/export';
import { ElementWatcher } from './element-watcher';

const NULLABLE_HTML_DIV_TYPE =
    UnionType<HTMLDivElement | null>([NullType, ElementWithTagType('div')]);

describe('watcher.ElementWatcher', () => {
  let shadowRoot: ShadowRoot;
  let mockVine: jasmine.SpyObj<VineImpl>;

  beforeEach(() => {
    const rootEl = document.createElement('div');
    shadowRoot = rootEl.attachShadow({mode: 'closed'});
    mockVine = jasmine.createSpyObj('Vine', ['setValue']);
  });

  describe('getValue_', () => {
    should(`return the correct element`, () => {
      const className = 'className';
      const el = document.createElement('div');
      el.classList.add(className);
      shadowRoot.appendChild(el);

      const watcher = new ElementWatcher<HTMLDivElement>(
          `.${className}`,
          ElementWithTagType('div'),
          instanceSourceId('source', ElementWithTagType('div')),
          mockVine);
      assert(watcher['getValue_'](shadowRoot)).to.be(el);
    });

    should(`throw error if the element does not exist`, () => {
      const el = document.createElement('div');
      shadowRoot.appendChild(el);

      const watcher = new ElementWatcher<HTMLDivElement>(
          `.nonExistentClass`,
          ElementWithTagType('div'),
          instanceSourceId('source', ElementWithTagType('div')),
          mockVine);
      assert(() => {
        watcher['getValue_'](shadowRoot);
      }).to.throwError(/Element of/i);
    });
  });

  describe('watch', () => {
    should(`update the source if the element has changed`, async () => {
      const context = new BaseDisposable();
      const sourceId = instanceSourceId('source', NULLABLE_HTML_DIV_TYPE);

      const watcher = new ElementWatcher<HTMLDivElement | null>(
          `div`,
          NULLABLE_HTML_DIV_TYPE,
          sourceId,
          mockVine);
      watcher.watch(shadowRoot, context);

      const el = document.createElement('div');
      shadowRoot.appendChild(el);

      await wait(mockVine.setValue).to.haveBeenCalledWith(sourceId, el, context);
    });
  });
});
