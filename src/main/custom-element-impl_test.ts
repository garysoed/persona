import { instanceStreamId } from 'grapevine/export/component';
import { VineImpl } from 'grapevine/export/main';
import { assert, Match, should } from 'gs-testing/export/main';
import { ImmutableSet } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { NumberType } from 'gs-types/export';
import { CustomElementImpl } from './custom-element-impl';

/**
 * @test
 */
class TestClass extends BaseDisposable { }

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
          jasmine.createSpyObj('RendererLocator1', ['getStreamId', 'setValue']);
      mockRendererLocator1.getStreamId.and.returnValue(nodeId1);

      const mockRendererLocator2 =
          jasmine.createSpyObj('RendererLocator2', ['getStreamId', 'setValue']);
      mockRendererLocator2.getStreamId.and.returnValue(nodeId2);

      const customElement = new CustomElementImpl(
          TestClass,
          element,
          ImmutableSet.of([mockRendererLocator1, mockRendererLocator2]),
          templateString,
          mockVine,
          'open');

      customElement.connectedCallback();

      const value = 123;
      assert(mockVine.listen).to.haveBeenCalledWith(
          nodeId1,
          Match.anyFunction(),
          Match.any(TestClass));
      mockVine.listen.calls.argsFor(0)[1](value);
      assert(mockRendererLocator1.setValue).to.haveBeenCalledWith(value);

      assert(mockVine.listen).to.haveBeenCalledWith(
          nodeId2,
          Match.anyFunction(),
          Match.any(TestClass));
      mockVine.listen.calls.argsFor(1)[1](value);
      assert(mockRendererLocator2.setValue).to.haveBeenCalledWith(value);
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
          mockVine,
          'open');

      assert(() => {
        customElement.disconnectedCallback();
      }).toNot.throw();
    });
  });
});
