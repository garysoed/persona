import { instanceSourceId } from 'grapevine/export/component';
import { VineBuilder, VineImpl } from 'grapevine/export/main';
import { assert, should, wait, waitFor } from 'gs-testing/export/main';
import { Mocks } from 'gs-testing/export/mock';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { IntegerParser } from 'gs-tools/export/parse';
import { InstanceofType, NullableType, NumberType } from 'gs-types/export';
import { attribute, ResolvedAttributeLocator } from './attribute-locator';
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
      const mockOnChange = jasmine.createSpy('OnChange');

      const innerEl = document.createElement('div');
      innerEl.setAttribute(ATTR_NAME, '456');
      shadowRoot.innerHTML = innerEl.outerHTML;

      const watcher = locator.createWatcher();
      watcher.watch(vine, mockOnChange, shadowRoot);

      await wait(mockOnChange).to.haveBeenCalledWith(456);

      // Grab the element.
      // tslint:disable-next-line:no-non-null-assertion
      const watchedEl = shadowRoot.querySelector('div')!;
      watchedEl.setAttribute(ATTR_NAME, '789');

      await wait(mockOnChange).to.haveBeenCalledWith(789);
    });
  });

  describe('onMutation_', () => {
    should(`update correctly`, () => {
      const target = document.createElement('div');
      target.setAttribute(ATTR_NAME, '123');

      const records: any[] = [
        {attributeName: ATTR_NAME, target},
      ];
      const mockOnChange = jasmine.createSpy('OnChange');

      locator['onMutation_'](records, mockOnChange);
      assert(mockOnChange).to.haveBeenCalledWith(123);
    });

    should(`use default value if the value cannot be parsed`, () => {
      const target = document.createElement('div');
      target.setAttribute(ATTR_NAME, 'abc');

      const records: any[] = [
        {attributeName: ATTR_NAME, target},
      ];
      const mockOnChange = jasmine.createSpy('OnChange');

      locator['onMutation_'](records, mockOnChange);
      assert(mockOnChange).to.haveBeenCalledWith(DEFAULT_VALUE);
    });

    should(`not update if target is not Element`, () => {
      const records: any[] = [
        {attributeName: ATTR_NAME, target: null},
      ];
      const mockOnChange = jasmine.createSpy('OnChange');

      locator['onMutation_'](records, mockOnChange);
      assert(mockOnChange).toNot.haveBeenCalled();
    });

    should(`not update if there are no attribute names`, () => {
      const records: any[] = [
        {attributeName: '', target: document.createElement('div')},
      ];
      const mockOnChange = jasmine.createSpy('OnChange');

      locator['onMutation_'](records, mockOnChange);
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

      await waitFor(() => divElement.getAttribute(ATTR_NAME)).to.be('123');
    });
  });

  describe('startWatch_', () => {
    should(`call onChange for attribute changes`, async () => {
      const watchedEl = document.createElement('div');
      watchedEl.setAttribute(ATTR_NAME, '456');
      const mockOnChange = jasmine.createSpy('OnChange');

      // tslint:disable-next-line:no-non-null-assertion
      const unlisten = locator['startWatch_'](watchedEl, null, mockOnChange)!;
      assert(unlisten.key).to.be(watchedEl);
      assert(mockOnChange).to.haveBeenCalledWith(456);

      watchedEl.setAttribute(ATTR_NAME, '789');
      await wait(mockOnChange).to.haveBeenCalledWith(789);
    });

    should(`dispose the previous undispose if for different element`, async () => {
      const oldEl = document.createElement('div');
      const mockPrevUnlisten = jasmine.createSpyObj('PrevUnlisten', ['dispose']);

      const watchedEl = document.createElement('div');
      watchedEl.setAttribute(ATTR_NAME, '456');
      const mockOnChange = jasmine.createSpy('OnChange');

      // tslint:disable-next-line:no-non-null-assertion
      const unlisten = locator['startWatch_'](
          watchedEl,
          {key: oldEl, unlisten: mockPrevUnlisten},
          mockOnChange)!;
      assert(unlisten.key).to.be(watchedEl);
      assert(mockOnChange).to.haveBeenCalledWith(456);

      watchedEl.setAttribute(ATTR_NAME, '789');
      await wait(mockOnChange).to.haveBeenCalledWith(789);
      assert(mockPrevUnlisten.dispose).to.haveBeenCalledWith();
    });

    should(`call onChange with default value if the element is removed`, () => {
      const mockOnChange = jasmine.createSpy('OnChange');

      const unlisten = locator['startWatch_'](null, null, mockOnChange);
      assert(unlisten).to.beNull();
      assert(mockOnChange).to.haveBeenCalledWith(DEFAULT_VALUE);
    });

    should(`dispose the previous undispose if element is removed`, () => {
      const oldEl = document.createElement('div');
      const mockPrevUnlisten = jasmine.createSpyObj('PrevUnlisten', ['dispose']);

      const mockOnChange = jasmine.createSpy('OnChange');

      const unlisten = locator['startWatch_'](
          null,
          {key: oldEl, unlisten: mockPrevUnlisten},
          mockOnChange);
      assert(unlisten).to.beNull();
      assert(mockOnChange).to.haveBeenCalledWith(DEFAULT_VALUE);
      assert(mockPrevUnlisten.dispose).to.haveBeenCalledWith();
    });

    should(`not observe changes if already observing`, () => {
      const watchedEl = document.createElement('div');
      watchedEl.setAttribute(ATTR_NAME, '456');
      const mockOnChange = jasmine.createSpy('OnChange');
      const mockUnlisten = jasmine.createSpyObj('Unlisten', ['dispose']);

      const oldUnlisten = {key: watchedEl, unlisten: mockUnlisten};

      // tslint:disable-next-line:no-non-null-assertion
      const unlisten = locator['startWatch_'](watchedEl, oldUnlisten, mockOnChange);
      assert(unlisten).to.be(oldUnlisten);
      assert(mockOnChange).toNot.haveBeenCalled();
    });
  });
});
