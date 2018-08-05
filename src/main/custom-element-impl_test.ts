// tslint:disable:no-non-null-assertion
import { VineImpl } from 'grapevine/export/main';
import { assert, match, should } from 'gs-testing/export/main';
import { createSpyInstance, spy, SpyObj } from 'gs-testing/export/spy';
import { ImmutableSet } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { BaseListener } from '../event/base-listener';
import { ResolvedRenderableLocator, ResolvedWatchableLocator } from '../locator/resolved-locator';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementImpl } from './custom-element-impl';

/**
 * @test
 */
class TestClass extends CustomElementCtrl {
  init(): void {
    // noop
  }
}

describe('main.CustomElementImpl', () => {
  let mockVine: SpyObj<VineImpl>;

  beforeEach(() => {
    mockVine = createSpyInstance('Vine', VineImpl.prototype);
  });

  describe(`connectedCallback`, () => {
    should(`set the shadow correctly`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';
      const customElement = new CustomElementImpl(
          TestClass,
          ImmutableSet.of(),
          element,
          ImmutableSet.of(),
          templateString,
          ImmutableSet.of(),
          mockVine,
          'open');

      customElement.connectedCallback();
      // tslint:disable-next-line:no-non-null-assertion
      assert(element.shadowRoot!.innerHTML).to.equal(templateString);
    });

    should(`setup the listeners correctly`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';

      const mockListener1 = createSpyInstance('Listener1', BaseListener.prototype);
      const mockListener2 = createSpyInstance('Listener2', BaseListener.prototype);

      const customElement = new CustomElementImpl(
          TestClass,
          ImmutableSet.of([mockListener1, mockListener2]),
          element,
          ImmutableSet.of(),
          templateString,
          ImmutableSet.of(),
          mockVine,
          'open');
      customElement.connectedCallback();

      assert(mockListener1.listen)
          .to.haveBeenCalledWith(mockVine, match.anyThat<TestClass>().beAnInstanceOf(TestClass));
      assert(mockListener2.listen)
          .to.haveBeenCalledWith(mockVine, match.anyThat<TestClass>().beAnInstanceOf(TestClass));
    });

    should(`setup the renderers correctly`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';

      const mockRendererLocator1 = createSpyInstance(
          'RendererLocator1',
          ResolvedRenderableLocator.prototype,
          ['startRender']);
      const mockRendererLocator2 = createSpyInstance(
          'RendererLocator2',
          ResolvedRenderableLocator.prototype,
          ['startRender']);

      const customElement = new CustomElementImpl(
          TestClass,
          ImmutableSet.of(),
          element,
          ImmutableSet.of([mockRendererLocator1, mockRendererLocator2]),
          templateString,
          ImmutableSet.of(),
          mockVine,
          'open');

      customElement.connectedCallback();

      assert(mockRendererLocator1.startRender).to
          .haveBeenCalledWith(mockVine, match.anyThat<TestClass>().beAnInstanceOf(TestClass));
      assert(mockRendererLocator2.startRender).to
          .haveBeenCalledWith(mockVine, match.anyThat<TestClass>().beAnInstanceOf(TestClass));
    });

    should(`setup the watchers correctly`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';

      const mockWatcher1 = createSpyInstance('Watcher1', ResolvedWatchableLocator.prototype);
      const mockWatcher2 = createSpyInstance('Watcher2', ResolvedWatchableLocator.prototype);

      const customElement = new CustomElementImpl(
          TestClass,
          ImmutableSet.of(),
          element,
          ImmutableSet.of(),
          templateString,
          ImmutableSet.of([mockWatcher1, mockWatcher2]),
          mockVine,
          'open');
      customElement.connectedCallback();

      assert(mockWatcher1.startWatch).to.haveBeenCalledWith(
          mockVine,
          match.anyThat<TestClass>().beAnInstanceOf(TestClass),
          element.shadowRoot!);
      assert(mockWatcher2.startWatch).to.haveBeenCalledWith(
          mockVine,
          match.anyThat<TestClass>().beAnInstanceOf(TestClass),
          element.shadowRoot!);
    });
  });

  describe(`disconnectedCallback`, () => {
    should(`dispose the component if has been connected`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';
      const customElement = new CustomElementImpl(
          TestClass,
          ImmutableSet.of(),
          element,
          ImmutableSet.of(),
          templateString,
          ImmutableSet.of(),
          mockVine,
          'open');

      const disposeSpy = spy(BaseDisposable.prototype, 'dispose');
      customElement.connectedCallback();
      customElement.disconnectedCallback();
      assert(disposeSpy).to.haveBeenCalledWith();
    });

    should(`not throw any errors if never connected`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';
      const customElement = new CustomElementImpl(
          TestClass,
          ImmutableSet.of(),
          element,
          ImmutableSet.of(),
          templateString,
          ImmutableSet.of(),
          mockVine,
          'open');

      assert(() => {
        customElement.disconnectedCallback();
      }).toNot.throw();
    });
  });
});
