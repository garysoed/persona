import { instanceSourceId } from 'grapevine/export/component';
import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { assert, match, retryUntil, should } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { createSpy, createSpyInstance } from 'gs-testing/export/spy';
import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { IntegerParser } from 'gs-tools/export/parse';
import { InstanceofType, NullableType, NumberType } from 'gs-types/export';
import { attribute, onMutation_, ResolvedAttributeLocator } from './attribute-locator';
import { element } from './element-locator';

describe('locator.AttributeLocator', () => {
  const ATTR_NAME = 'attr';
  const DEFAULT_VALUE = 123;
  const elementLocator = element('div', NullableType(InstanceofType(HTMLElement)));
  let locator: ResolvedAttributeLocator<number>;

  beforeEach(() => {
    locator = attribute(elementLocator, ATTR_NAME, IntegerParser, NumberType, DEFAULT_VALUE);
  });

  describe('createWatcher', () => {
    should(`create watcher that watches for attribute changes`, async () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});
      const vine = Mocks.object<VineImpl>('vine');
      const mockOnChange = createSpy('OnChange');

      const innerEl = document.createElement('div');
      innerEl.setAttribute(ATTR_NAME, '456');
      shadowRoot.innerHTML = innerEl.outerHTML;

      const watcher = locator.createWatcher();
      watcher.watch(vine, mockOnChange, shadowRoot);

      assert(watcher.getValue(shadowRoot)).to.equal(456);

      await retryUntil(() => mockOnChange).to
          .equal(match.anySpyThat().haveBeenCalledWith(shadowRoot));

      // Grab the element.
      // tslint:disable-next-line:no-non-null-assertion
      const watchedEl = shadowRoot.querySelector('div')!;
      watchedEl.setAttribute(ATTR_NAME, '789');

      await retryUntil(() => mockOnChange).to
          .equal(match.anySpyThat().haveBeenCalledWith(shadowRoot));
    });

    should(`create watcher that returns the default value if the element's attribute is missing`,
           () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});

      const innerEl = document.createElement('div');
      shadowRoot.innerHTML = innerEl.outerHTML;

      const watcher = locator.createWatcher();

      assert(watcher.getValue(shadowRoot)).to.equal(DEFAULT_VALUE);
    });
  });

  describe('getAttributeValue_', () => {
    should(`return the correct value`, () => {
      const value = 456;
      const el = document.createElement('div');
      el.setAttribute(ATTR_NAME, `${value}`);

      assert(locator['getAttributeValue_'](el)).to.equal(value);
    });

    should(`return null if element is null`, () => {
      assert(locator['getAttributeValue_'](null)).to.beNull();
    });
  });

  describe('getValue', () => {
    should(`return the correct value`, () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});
      const value = 456;
      const el = document.createElement('div');
      el.setAttribute(ATTR_NAME, `${value}`);
      shadowRoot.appendChild(el);

      assert(locator.getValue(shadowRoot)).to.equal(value);
    });

    should(`return the default value if the value type is not correct`, () => {
      const root = document.createElement('div');
      const shadowRoot = root.attachShadow({mode: 'open'});
      const el = document.createElement('div');
      el.setAttribute(ATTR_NAME, 'abc');
      shadowRoot.appendChild(el);

      assert(locator.getValue(shadowRoot)).to.equal(DEFAULT_VALUE);
    });
  });

  describe('onMutation_', () => {
    should(`update correctly`, () => {
      const target = document.createElement('div');
      target.setAttribute(ATTR_NAME, '123');

      const root = document.createElement('div').attachShadow({mode: 'open'});
      const records: any[] = [
        {attributeName: ATTR_NAME, target},
      ];
      const mockOnChange = createSpy('OnChange');

      onMutation_(root, records, mockOnChange);
      assert(mockOnChange).to.haveBeenCalledWith(root);
    });

    should(`not update if target is not Element`, () => {
      const records: any[] = [
        {attributeName: ATTR_NAME, target: null},
      ];
      const mockOnChange = createSpy('OnChange');
      const root = document.createElement('div').attachShadow({mode: 'open'});

      onMutation_(root, records, mockOnChange);
      assert(mockOnChange).toNot.haveBeenCalled();
    });

    should(`not update if there are no attribute names`, () => {
      const records: any[] = [
        {attributeName: '', target: document.createElement('div')},
      ];
      const mockOnChange = createSpy('OnChange');
      const root = document.createElement('div').attachShadow({mode: 'open'});

      onMutation_(root, records, mockOnChange);
      assert(mockOnChange).toNot.haveBeenCalled();
    });
  });

  describe('startRender', () => {
    should(`render the attribute correctly`, async () => {
      const context = new BaseDisposable();
      const vineBuilder = new VineBuilder();

      // Sets up the test source and stream.
      const testSourceId = instanceSourceId('test', NumberType);
      vineBuilder.source(testSourceId, 0);
      vineBuilder.stream(locator.getWritingId(), testValue => testValue, testSourceId);

      // Sets up the element locator.
      vineBuilder.source(elementLocator.getReadingId(), null);

      const vine = vineBuilder.run();
      locator.startRender(vine, context);

      const divElement = document.createElement('div');
      vine.setValue(elementLocator.getReadingId(), divElement, context);
      vine.setValue(testSourceId, 123, context);

      await retryUntil(() => divElement.getAttribute(ATTR_NAME)).to.equal('123');
    });
  });

  describe('startWatch_', () => {
    should(`call onChange for attribute changes`, async () => {
      const watchedEl = document.createElement('div');
      watchedEl.setAttribute(ATTR_NAME, '456');
      const root = document.createElement('div').attachShadow({mode: 'open'});
      const mockOnChange = createSpy('OnChange');

      // tslint:disable-next-line:no-non-null-assertion
      const unlisten = locator['startWatch_'](root, watchedEl, null, mockOnChange)!;
      assert(unlisten.key).to.equal(watchedEl);
      assert(mockOnChange).to.haveBeenCalledWith(root);
    });

    should(`dispose the previous undispose if for different element`, async () => {
      const oldEl = document.createElement('div');
      const mockPrevUnlisten = createSpyInstance(DisposableFunction);

      const watchedEl = document.createElement('div');
      watchedEl.setAttribute(ATTR_NAME, '456');
      const root = document.createElement('div').attachShadow({mode: 'open'});
      const mockOnChange = createSpy('OnChange');

      // tslint:disable-next-line:no-non-null-assertion
      const unlisten = locator['startWatch_'](
          root,
          watchedEl,
          {key: oldEl, unlisten: mockPrevUnlisten},
          mockOnChange)!;
      assert(unlisten.key).to.equal(watchedEl);
      assert(mockOnChange).to.haveBeenCalledWith(root);
    });

    should(`not observe changes if already observing`, () => {
      const watchedEl = document.createElement('div');
      watchedEl.setAttribute(ATTR_NAME, '456');
      const mockOnChange = createSpy('OnChange');
      const mockUnlisten = createSpyInstance(DisposableFunction);
      const oldUnlisten = {key: watchedEl, unlisten: mockUnlisten};
      const root = document.createElement('div').attachShadow({mode: 'open'});

      // tslint:disable-next-line:no-non-null-assertion
      const unlisten = locator['startWatch_'](root, watchedEl, oldUnlisten, mockOnChange);
      assert(unlisten).to.equal(oldUnlisten);
      assert(mockOnChange).toNot.haveBeenCalled();
    });
  });
});
