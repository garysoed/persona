import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { assert, Match, should } from 'gs-testing/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { NumberType } from 'gs-types/export';
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
  let mockVine: jasmine.SpyObj<VineImpl>;

  beforeEach(() => {
    mockVine = jasmine.createSpyObj('Vine', ['listen']);
  });

  describe(`connectedCallback`, () => {
    should(`set the shadow correctly`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';
      const customElement = new CustomElementImpl(
          TestClass,
          element,
          ImmutableSet.of(),
          templateString,
          ImmutableSet.of(),
          mockVine,
          'open');

      customElement.connectedCallback();
      // tslint:disable-next-line:no-non-null-assertion
      assert(element.shadowRoot!.innerHTML).to.be(templateString);
    });

    should(`setup the renderers correctly`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';

      const nodeId1 = instanceStreamId('node1', NumberType);
      const nodeId2 = instanceStreamId('node2', NumberType);
      const mockRendererLocator1 =
          jasmine.createSpyObj('RendererLocator1', ['getStreamId', 'startRender']);
      mockRendererLocator1.getStreamId.and.returnValue(nodeId1);

      const mockRendererLocator2 =
          jasmine.createSpyObj('RendererLocator2', ['getStreamId', 'startRender']);
      mockRendererLocator2.getStreamId.and.returnValue(nodeId2);

      const customElement = new CustomElementImpl(
          TestClass,
          element,
          ImmutableSet.of([mockRendererLocator1, mockRendererLocator2]),
          templateString,
          ImmutableSet.of(),
          mockVine,
          'open');

      customElement.connectedCallback();

      assert(mockRendererLocator1.startRender).to
          .haveBeenCalledWith(mockVine, Match.any(TestClass));
      assert(mockRendererLocator2.startRender).to
          .haveBeenCalledWith(mockVine, Match.any(TestClass));
    });

    should(`setup the watchers correctly`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';

      const mockWatcher1 = jasmine.createSpyObj('Watcher1', ['watch']);
      const mockWatcher2 = jasmine.createSpyObj('Watcher2', ['watch']);

      const customElement = new CustomElementImpl(
          TestClass,
          element,
          ImmutableSet.of(),
          templateString,
          ImmutableSet.of([mockWatcher1, mockWatcher2]),
          mockVine,
          'open');
      customElement.connectedCallback();

      assert(mockWatcher1.watch).to.haveBeenCalledWith(element.shadowRoot, Match.any(TestClass));
      assert(mockWatcher2.watch).to.haveBeenCalledWith(element.shadowRoot, Match.any(TestClass));
    });
  });

  describe(`disconnectedCallback`, () => {
    should(`dispose the component if has been connected`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';
      const customElement = new CustomElementImpl(
          TestClass,
          element,
          ImmutableSet.of(),
          templateString,
          ImmutableSet.of(),
          mockVine,
          'open');

      spyOn(BaseDisposable.prototype, 'dispose');
      customElement.connectedCallback();
      customElement.disconnectedCallback();
      assert(BaseDisposable.prototype.dispose).to.haveBeenCalledWith();
    });

    should(`not throw any errors if never connected`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';
      const customElement = new CustomElementImpl(
          TestClass,
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
