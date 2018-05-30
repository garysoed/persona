import { VineImpl } from 'grapevine/export/main';
import { assert, should, wait } from 'gs-testing/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { ElementWithTagType, NullType, UnionType } from 'gs-types/export';
import { element } from '../locator/element-locator';
import { ElementWatcher } from './element-watcher';

describe('hook.ElementHook', () => {
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
      const locator = element(`.${className}`, ElementWithTagType('div'));

      const watcher = new ElementWatcher<HTMLDivElement>(locator, mockVine);
      assert(watcher['getValue_'](shadowRoot)).to.be(el);
    });

    should(`throw error if the element does not exist`, () => {
      const el = document.createElement('div');
      shadowRoot.appendChild(el);

      const locator = element(`.nonExistentClass`, ElementWithTagType('div'));

      const watcher = new ElementWatcher<HTMLDivElement>(locator, mockVine);
      assert(() => {
        watcher['getValue_'](shadowRoot);
      }).to.throwError(/Element of/i);
    });
  });

  describe('watch', () => {
    should(`update the source if the element has changed`, async () => {
      const locator = element(
          'div',
          UnionType<HTMLDivElement | null>([NullType, ElementWithTagType('div')]));
      const context = new BaseDisposable();

      const watcher = new ElementWatcher<HTMLDivElement|null>(locator, mockVine);
      watcher.watch(shadowRoot, context);

      const el = document.createElement('div');
      shadowRoot.appendChild(el);

      await wait(mockVine.setValue).to.haveBeenCalledWith(locator.getSourceId(), el, context);
    });
  });
});
