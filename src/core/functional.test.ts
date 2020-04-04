import { source, stream, Vine, VineBuilder } from 'grapevine';
import { assert, createSpy, should, Spy, test } from 'gs-testing';
import { identity } from 'nabu';
import { BehaviorSubject, Observable, of as observableOf } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { attribute as attributeIn } from '../input/attribute';
import { element } from '../main/element';
import { attribute as attributeOut } from '../output/attribute';
import { ElementTester } from '../testing/element-tester';
import { PersonaTester, PersonaTesterFactory } from '../testing/persona-tester';
import { CustomElementCtrl } from '../types/custom-element-ctrl';

import { Builder as PersonaBuilder } from './builder';
import { PersonaContext } from './persona-context';


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

const $HANDLER = source(
    () => new BehaviorSubject(() => undefined),
    globalThis,
);

@_p.baseCustomElement({
  shadowMode: 'open',
})
class ParentTestClass extends CustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.host._.attr1, this.overriddenRender());
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
  private readonly handlerSbj = $HANDLER.get(this.vine);
  private readonly providesValueStream = stream(this.providesValue, this).get(this.vine);

  constructor(context: PersonaContext) {
    super(context);

    this.handlerSbj
        .pipe(
            tap(handler => handler()),
            takeUntil(this.onDispose$),
        )
        .subscribe();
    this.render($.host._.attr2, this.providesValueStream);
    this.render($.host._.attr1, this.overriddenRender());
    this.render($.host._.attr3, this.overriddenRender());
  }

  overriddenRender(): Observable<string> {
    return stream(this.providesValue, this).get(this.vine).pipe(map(value => `${value}abc`));
  }

  // tslint:disable-next-line: prefer-function-over-method
  providesValue(): Observable<string> {
    return this.declareInput($.host._.attr4).pipe(map(v => `123-${v}`));
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
