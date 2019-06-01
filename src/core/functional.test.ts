import { VineBuilder } from '@grapevine';
import { assert, createSpy, should, Spy, test } from '@gs-testing';
import { identity } from '@nabu';
import { BehaviorSubject, Observable, of as observableOf } from '@rxjs';
import { map, tap } from '@rxjs/operators';
import { attribute as attributeIn } from '../input/attribute';
import { element } from '../main/element';
import { attribute as attributeOut } from '../output/attribute';
import { ElementTester } from '../testing/element-tester';
import { PersonaTester, PersonaTesterFactory } from '../testing/persona-tester';
import { CustomElementCtrl } from '../types/custom-element-ctrl';
import { InitFn } from '../types/init-fn';
import { Builder as PersonaBuilder } from './builder';

const _v = new VineBuilder();
const _p = new PersonaBuilder(_v);
const $ = {
  host: element({
    attr1: attributeOut('attr1', identity()),
    attr2: attributeOut('attr2', identity()),
    attr3: attributeOut('attr3', identity()),
    attr4: attributeIn('attr4', identity()),
  }),
};

const $HANDLER = _v.source(
    () => new BehaviorSubject(() => undefined),
    globalThis,
);

@_p.baseCustomElement({
  shadowMode: 'open',
})
class ParentTestClass extends CustomElementCtrl {
  getInitFunctions(): InitFn[] {
    return [
      _p
          .render($.host._.attr1)
          .withVine(_v.stream(this.overriddenRender, this)),
    ];
  }

  overriddenRender(): Observable<string> {
    return observableOf('abc');
  }
}

/**
 * @test
 */
@_p.customElement({
  tag: 'test-el',
  template: '',
})
class TestClass extends ParentTestClass {
  private readonly attr4 = _p.input($.host._.attr4, this);
  private readonly handlerSbj = $HANDLER.asSubject();
  private readonly providesValueStream = _v.stream(this.providesValue, this).asObservable();

  getInitFunctions(): InitFn[] {
    return [
      ...super.getInitFunctions(),
      () => this.handlerSbj.pipe(tap(handler => handler())),
      _p
          .render($.host._.attr2)
          .withObservable(this.providesValueStream),
      _p
          .render($.host._.attr1, $.host._.attr3)
          .withVine(_v.stream(this.overriddenRender, this)),
    ];
  }

  overriddenRender(): Observable<string> {
    return this.providesValueStream.pipe(map(value => `${value}abc`));
  }

  // tslint:disable-next-line: prefer-function-over-method
  providesValue(): Observable<string> {
    return this.attr4.pipe(map(v => `123-${v}`));
  }
}

const testerFactory = new PersonaTesterFactory(_p);

test('@persona/core/functional', () => {
  let mockHandler: Spy<undefined, []>;
  let tester: PersonaTester;
  let el: ElementTester;

  beforeEach(() => {
    mockHandler = createSpy('handler');
    tester = testerFactory.build([TestClass]);
    const s = $HANDLER.get(tester.vine);
    s.next(mockHandler);

    el = tester.createElement('test-el', document.body);
  });

  should(`set up the component correctly`, () => {
    assert(el.getAttribute($.host._.attr1)).to.emitWith('123-abc');
    assert(el.getAttribute($.host._.attr2)).to.emitWith('123-');
    assert(el.getAttribute($.host._.attr3)).to.emitWith('123-abc');
    // tslint:disable-next-line:no-non-null-assertion
    assert(el.element.shadowRoot!.mode).to.equal('open');
    assert(mockHandler).to.haveBeenCalledWith();
  });
});
