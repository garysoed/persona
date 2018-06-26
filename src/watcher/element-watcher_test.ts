import { instanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { should, wait } from 'gs-testing/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { ElementWithTagType } from 'gs-types/export';
import { ElementWatcher } from './element-watcher';

describe('watcher.ElementWatcher', () => {
  let shadowRoot: ShadowRoot;
  let mockVine: jasmine.SpyObj<VineImpl>;

  beforeEach(() => {
    const rootEl = document.createElement('div');
    shadowRoot = rootEl.attachShadow({mode: 'closed'});
    mockVine = jasmine.createSpyObj('Vine', ['setValue']);
  });

  describe('watch', () => {
    should(`update the source if the element has changed`, async () => {
      const context = new BaseDisposable();
      const sourceId = instanceSourceId('source', ElementWithTagType('div'));

      const watcher = new ElementWatcher<HTMLDivElement|null>(
          root => root.querySelector('div'),
          sourceId,
          mockVine);
      watcher.watch(shadowRoot, context);

      const el = document.createElement('div');
      shadowRoot.appendChild(el);

      await wait(mockVine.setValue).to.haveBeenCalledWith(sourceId, el, context);
    });
  });
});
