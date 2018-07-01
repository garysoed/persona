import { VineImpl } from 'grapevine/export/main';
import { assert, should, wait } from 'gs-testing/export/main';
import { ElementWatcher } from './element-watcher';

describe('watcher.ElementWatcher', () => {
  let shadowRoot: ShadowRoot;
  let mockVine: jasmine.SpyObj<VineImpl>;

  beforeEach(() => {
    const rootEl = document.createElement('div');
    shadowRoot = rootEl.attachShadow({mode: 'closed'});
    mockVine = jasmine.createSpyObj('Vine', ['setValue']);
  });

  describe('startWatching_', () => {
    should(`update the source if the element has changed`, async () => {
      const watcher = new ElementWatcher<HTMLDivElement|null>(root => root.querySelector('div'));

      const mockOnChange = jasmine.createSpy('OnChange');

      const disposableFn = watcher['startWatching_'](mockVine, mockOnChange, shadowRoot);
      assert(mockOnChange).to.haveBeenCalledWith(null);

      mockOnChange.calls.reset();

      const el = document.createElement('div');
      shadowRoot.appendChild(el);

      await wait(mockOnChange).to.haveBeenCalledWith(el);
      disposableFn.dispose();
    });
  });
});
