import { instanceSourceId, InstanceSourceId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { Listener } from 'grapevine/src/node/listener';
import { assert, Match, should, wait } from 'gs-testing/export/main';
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
  let mockElementWatcher: jasmine.SpyObj<Watcher<HTMLElement>>;
  let mockVine: jasmine.SpyObj<VineImpl>;

  beforeEach(() => {
    mockElementWatcher = jasmine.createSpyObj('ElementWatcher', ['watch']);
    mockVine = jasmine.createSpyObj('Vine', ['listen', 'setValue']);
    watcher = new AttributeWatcher(
        mockElementWatcher,
        ELEMENT_SOURCE_ID,
        IntegerParser,
        NumberType,
        ATTR_NAME,
        SOURCE_ID,
        mockVine);
  });

  describe('updateVine_', () => {
    should(`update vine correctly`, () => {
      const target = document.createElement('div');
      target.setAttribute(ATTR_NAME, '123');

      const records: any[] = [
        {attributeName: ATTR_NAME, target},
      ];
      const context = new BaseDisposable();

      watcher['updateVine_'](records, context);
      assert(mockVine.setValue).to.haveBeenCalledWith(SOURCE_ID, 123, context);
    });

    should(`not update vine if the value cannot be parsed`, () => {
      const target = document.createElement('div');
      target.setAttribute(ATTR_NAME, 'abc');

      const records: any[] = [
        {attributeName: ATTR_NAME, target},
      ];
      const context = new BaseDisposable();

      watcher['updateVine_'](records, context);
      assert(mockVine.setValue).toNot.haveBeenCalled();
    });

    should(`not update vine if target is not Element`, () => {
      const records: any[] = [
        {attributeName: ATTR_NAME, target: null},
      ];
      const context = new BaseDisposable();

      watcher['updateVine_'](records, context);
      assert(mockVine.setValue).toNot.haveBeenCalled();
    });

    should(`not update vine if there are no attribute names`, () => {
      const records: any[] = [
        {attributeName: '', target: document.createElement('div')},
      ];
      const context = new BaseDisposable();

      watcher['updateVine_'](records, context);
      assert(mockVine.setValue).toNot.haveBeenCalled();
    });
  });

  describe('watch', () => {
    should(`watch changes to attribute and element`, async () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const element = document.createElement('div');
      element.setAttribute(ATTR_NAME, '123');
      const context = new BaseDisposable();

      mockVine.listen.and.callFake(
          (_: InstanceSourceId<HTMLElement>, handler: Listener<HTMLElement>) => {
            handler(element);
          });

      watcher.watch(shadowRoot, context);
      assert(mockVine.setValue).to.haveBeenCalledWith(SOURCE_ID, 123, context);
      assert(mockVine.listen).to
          .haveBeenCalledWith(ELEMENT_SOURCE_ID, Match.anyFunction(), context);

      element.setAttribute(ATTR_NAME, '456');
      await wait(mockVine.setValue).to.haveBeenCalledWith(SOURCE_ID, 456, context);
    });
  });
});
