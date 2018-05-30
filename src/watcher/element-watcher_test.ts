import { VineImpl } from 'grapevine/export/main';
import { assert } from 'gs-testing/export/main';
import { should } from 'gs-testing/src/main/run';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { ElementWithTagType } from 'gs-types/export';
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

  describe('install', () => {
    should(`set the value in the source node correctly`, () => {
      const className = 'className';
      const el = document.createElement('div');
      el.classList.add(className);
      shadowRoot.appendChild(el);

      const locator = element(`.${className}`, ElementWithTagType('div'));
      const component = new BaseDisposable();

      const watcher = new ElementWatcher<HTMLDivElement>(locator, mockVine);
      watcher.watch(shadowRoot, component);
      assert(mockVine.setValue).to.haveBeenCalledWith(locator.getSourceId(), el, component);
    });

    should(`throw error if the element does not exist`, () => {
      const el = document.createElement('div');
      shadowRoot.appendChild(el);

      const locator = element(`.nonExistentClass`, ElementWithTagType('div'));
      const component = new BaseDisposable();

      const watcher = new ElementWatcher<HTMLDivElement>(locator, mockVine);
      assert(() => {
        watcher.watch(shadowRoot, component);
      }).to.throwError(/Element of/i);
    });
  });
});
