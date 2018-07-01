import { instanceSourceId, InstanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { Listener } from 'grapevine/src/node/listener';
import { assert, fshould, Match, should, wait } from 'gs-testing/export/main';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { IntegerParser } from 'gs-tools/export/parse';
import { InstanceofType, NumberType } from 'gs-types/export';
import { AttributeWatcher } from './attribute-watcher';
import { Watcher } from './watcher';

describe('watcher.AttributeWatcher', () => {
  const ATTR_NAME = 'attrname';
  const ELEMENT_SOURCE_ID = instanceSourceId('element', InstanceofType(HTMLElement));
  const SOURCE_ID = instanceSourceId('source', NumberType);

  let watcher: AttributeWatcher<number>;
  let mockElementWatcher: jasmine.SpyObj<Watcher<HTMLElement|null>>;
  let mockVine: jasmine.SpyObj<VineImpl>;

  beforeEach(() => {
    mockElementWatcher = jasmine.createSpyObj('ElementWatcher', ['watch']);
    mockVine = jasmine.createSpyObj('Vine', ['listen', 'setValue']);
    watcher = new AttributeWatcher(
        mockElementWatcher,
        IntegerParser,
        NumberType,
        ATTR_NAME,
        SOURCE_ID);
  });

  describe('startWatching_', () => {
    should(`watch changes to attribute and element`, async () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const element = document.createElement('div');
      element.setAttribute(ATTR_NAME, '123');

      const mockUnwatch = jasmine.createSpyObj('Unwatch', ['dispose']);
      mockElementWatcher.watch.and.returnValue(mockUnwatch);

      const mockOnChange = jasmine.createSpy('OnChange');

      const disposableFn = watcher['startWatching_'](mockVine, mockOnChange, shadowRoot);
      assert(mockElementWatcher.watch).to
          .haveBeenCalledWith(mockVine, Match.anyFunction(), shadowRoot);

      mockElementWatcher.watch.calls.argsFor(0)[1](element);
      assert(mockOnChange).to.haveBeenCalledWith(123);

      mockOnChange.calls.reset();

      element.setAttribute(ATTR_NAME, '456');
      await wait(mockOnChange).to.haveBeenCalledWith(456);

      disposableFn.dispose();
      assert(mockUnwatch.dispose).to.haveBeenCalledWith();
    });
  });

  describe('updateVine_', () => {
    should(`update correctly`, () => {
      const target = document.createElement('div');
      target.setAttribute(ATTR_NAME, '123');

      const records: any[] = [
        {attributeName: ATTR_NAME, target},
      ];
      const mockOnChange = jasmine.createSpy('OnChange');

      watcher['updateVine_'](records, mockOnChange);
      assert(mockOnChange).to.haveBeenCalledWith(123);
    });

    should(`not update if the value cannot be parsed`, () => {
      const target = document.createElement('div');
      target.setAttribute(ATTR_NAME, 'abc');

      const records: any[] = [
        {attributeName: ATTR_NAME, target},
      ];
      const mockOnChange = jasmine.createSpy('OnChange');

      watcher['updateVine_'](records, mockOnChange);
      assert(mockOnChange).toNot.haveBeenCalled();
    });

    should(`not update if target is not Element`, () => {
      const records: any[] = [
        {attributeName: ATTR_NAME, target: null},
      ];
      const mockOnChange = jasmine.createSpy('OnChange');

      watcher['updateVine_'](records, mockOnChange);
      assert(mockOnChange).toNot.haveBeenCalled();
    });

    should(`not update if there are no attribute names`, () => {
      const records: any[] = [
        {attributeName: '', target: document.createElement('div')},
      ];
      const mockOnChange = jasmine.createSpy('OnChange');

      watcher['updateVine_'](records, mockOnChange);
      assert(mockOnChange).toNot.haveBeenCalled();
    });
  });
});
