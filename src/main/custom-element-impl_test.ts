// tslint:disable:no-non-null-assertion
import { VineImpl } from 'grapevine/export/main';
import { assert, match, should, test } from 'gs-testing/export/main';
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
  init(vine: VineImpl): void {
    // noop
  }
}

test('main.CustomElementImpl', () => {
  let mockVine: SpyObj<VineImpl>;

  beforeEach(() => {
    mockVine = createSpyInstance(VineImpl);
  });

  test(`connectedCallback`, () => {
    should(`set the shadow correctly`, async () => {
      const element = document.createElement('div');
      const templateString = 'templateString';
      const spyInit = spy(TestClass.prototype, 'init');
      const customElement = new CustomElementImpl(
          TestClass,
          ImmutableSet.of(),
          element,
          ImmutableSet.of(),
          templateString,
          ImmutableSet.of(),
          mockVine,
          'open');

      await customElement.connectedCallback();
      // tslint:disable-next-line:no-non-null-assertion
      assert(element.shadowRoot!.innerHTML).to.equal(templateString);

      assert(spyInit).to.haveBeenCalledWith(mockVine);
    });

    should(`setup the listeners correctly`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';

      const mockListener1 = createSpyInstance(BaseListener);
      const mockListener2 = createSpyInstance(BaseListener);

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
          ResolvedRenderableLocator,
          ['startRender']);
      const mockRendererLocator2 = createSpyInstance(
          ResolvedRenderableLocator,
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

      const mockWatcher1 = createSpyInstance(ResolvedWatchableLocator);
      const mockWatcher2 = createSpyInstance(ResolvedWatchableLocator);

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

  test(`disconnectedCallback`, () => {
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
