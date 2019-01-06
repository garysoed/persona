// tslint:disable:no-non-null-assertion
import { VineImpl } from 'grapevine/export/main';
import { assert, match, should, test } from 'gs-testing/export/main';
import { createSpyInstance, fake, spy, SpyObj } from 'gs-testing/export/spy';
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

      const methodSpy = spy(TestClass.prototype, 'method');
      fake(methodSpy).always().return(observableOf('123'));

      const obs1 = observableOf('1');
      const obs2 = observableOf('2');
      fake(mockVine.resolveParams).always().return(ImmutableList.of([obs1, obs2]));

      const customElement = new CustomElementImpl(
          TestClass,
          element,
          ImmutableSet.of([{target: TestClass, propertyKey: 'method'}]),
          ImmutableSet.of(),
          templateString,
          mockVine,
          'open',
      );
      customElement.connectedCallback();

      assert(methodSpy).to.haveBeenCalledWith(obs1, obs2);
      assert(mockVine.resolveParams).to.haveBeenCalledWith(
          match.anyObjectThat<TestClass>().beAnInstanceOf(TestClass),
          'method',
      );
    });

    should(`setup the outputs correctly`, () => {
      const element = document.createElement('div');
      const templateString = 'templateString';

      const methodSpy = spy(TestClass.prototype, 'method');
      const resultObs = observableOf('123');
      fake(methodSpy).always().return(resultObs);

      const obs1 = observableOf('a');
      const obs2 = observableOf('b');
      fake(mockVine.resolveParams).always().return(ImmutableList.of([obs1, obs2]));

      const mockOutput = createSpyInstance(InnerHtmlOutput);

      const customElement = new CustomElementImpl(
          TestClass,
          element,
          ImmutableSet.of(),
          ImmutableSet.of([{target: TestClass, propertyKey: 'method', output: mockOutput}]),
          templateString,
          mockVine,
          'open',
      );
      customElement.connectedCallback();

      assert(mockOutput.output).to.haveBeenCalledWith(element.shadowRoot!, resultObs);
      assert(methodSpy).to.haveBeenCalledWith(obs1, obs2);
      assert(mockVine.resolveParams).to.haveBeenCalledWith(
          match.anyObjectThat<TestClass>().beAnInstanceOf(TestClass),
          'method',
      );
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
