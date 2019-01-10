// tslint:disable:no-non-null-assertion
import { VineImpl } from 'grapevine/export/main';
import { assert, match, should, test } from 'gs-testing/export/main';
import { createSpy, createSpyInstance, fake, spy, SpyObj } from 'gs-testing/export/spy';
import { ImmutableList, ImmutableSet } from 'gs-tools/export/collect';
import { BaseDisposable } from 'gs-tools/export/dispose';
import { Observable, of as observableOf } from 'rxjs';
import { InnerHtmlOutput } from '../output/inner-html';
import { CustomElementCtrl } from './custom-element-ctrl';
import { CustomElementImpl } from './custom-element-impl';

/**
 * @test
 */
class TestClass extends CustomElementCtrl {
  init(vine: VineImpl): void {
    // noop
  }

  method(
      _1: Observable<string>,
      _2: Observable<string>,
  ): Observable<string> {
    return observableOf('unmocked');
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
          element,
          ImmutableSet.of(),
          templateString,
          mockVine,
          'open');

      await customElement.connectedCallback();
      // tslint:disable-next-line:no-non-null-assertion
      assert(element.shadowRoot!.innerHTML).to.equal(templateString);

      assert(spyInit).to.haveBeenCalledWith(mockVine);
    });

    should(`setup the onCreate handlers correctly`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';

      const mockHandler1 = createSpy<
          Observable<unknown>,
          [CustomElementCtrl, VineImpl, ShadowRoot]
      >('Handler1');
      fake(mockHandler1).always().return(observableOf(1));

      const mockHandler2 = createSpy<
          Observable<unknown>,
          [CustomElementCtrl, VineImpl, ShadowRoot]
      >('Handler2');
      fake(mockHandler2).always().return(observableOf(2));

      const customElement = new CustomElementImpl(
          TestClass,
          element,
          ImmutableSet.of([mockHandler1, mockHandler2]),
          templateString,
          mockVine,
          'open',
      );
      customElement.connectedCallback();

      const testClassMatcher = match.anyObjectThat<TestClass>().beAnInstanceOf(TestClass);
      const shadowRootMatcher = match.anyThing<ShadowRoot>();
      assert(mockHandler1).to.haveBeenCalledWith(testClassMatcher, mockVine, shadowRootMatcher);
      assert(mockHandler2).to.haveBeenCalledWith(testClassMatcher, mockVine, shadowRootMatcher);
    });
  });

  test(`disconnectedCallback`, () => {
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
