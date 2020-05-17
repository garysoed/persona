import { source, stream, VineBuilder } from 'grapevine';
import { assert, createSpy, should, test } from 'gs-testing';
import { identity } from 'nabu';
import { Observable, of as observableOf } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { attribute as attributeIn } from '../input/attribute';
import { host } from '../main/host';
import { attribute as attributeOut } from '../output/attribute';
import { PersonaTesterFactory } from '../testing/persona-tester';
import { CustomElementCtrl } from '../types/custom-element-ctrl';

import { Builder as PersonaBuilder } from './builder';
import { PersonaContext } from './persona-context';


const _v = new VineBuilder();
const _p = new PersonaBuilder(_v);

const $$ = {
  tag: 'test-el',
  api: {
    attr4: attributeIn('attr4', identity(), ''),
  },
};
const $ = {
  host: host({
    ...$$.api,
    attr1: attributeOut('attr1', identity()),
    attr2: attributeOut('attr2', identity()),
    attr3: attributeOut('attr3', identity()),
  }),
};

const $HANDLER = source(() => () => undefined);

@_p.baseCustomElement({
  shadowMode: 'open',
})
class ParentTestClass extends CustomElementCtrl {
  constructor(context: PersonaContext) {
    super(context);

    this.render($.host._.attr1, this.overriddenRender());
  }

  protected overriddenRender(): Observable<string> {
    return observableOf('abc');
  }
}

/**
 * @test
 */
@_p.customElement({
  ...$$,
  template: '',
})
class TestClass extends ParentTestClass {
  private readonly handlerSbj = $HANDLER.get(this.vine);
  private readonly providesValueStream = stream(this.providesValue, this).get(this.vine);

  constructor(context: PersonaContext) {
    super(context);
    this.render($.host._.attr1, this.overriddenRender());
    this.render($.host._.attr2, this.providesValueStream);
    this.render($.host._.attr3, this.overriddenRender());
    this.addSetup(this.setupHandler());
  }

  protected overriddenRender(): Observable<string> {
    return stream(this.providesValue, this).get(this.vine).pipe(map(value => `${value}abc`));
  }

  private providesValue(): Observable<string> {
    return this.declareInput($.host._.attr4).pipe(map(v => `123-${v}`));
  }

  private setupHandler(): Observable<unknown> {
    return this.handlerSbj.pipe(tap(handler => handler()));
  }
}

const testerFactory = new PersonaTesterFactory(_p);

test('@persona/core/functional', init => {
  const _ = init(() => {
    const mockHandler = createSpy<undefined, []>('handler');
    const tester = testerFactory.build([TestClass], document);
    $HANDLER.set(tester.vine, () => mockHandler);

    const el = tester.createElement('test-el');
    return {el, tester, mockHandler};
  });

  should(`set up the component correctly`, () => {
    assert(_.el.getAttribute($.host._.attr1)).to.emitWith('123-abc');
    assert(_.el.getAttribute($.host._.attr2)).to.emitWith('123-');
    assert(_.el.getAttribute($.host._.attr3)).to.emitWith('123-abc');

    assert(_.el.element.shadowRoot?.mode).to.equal('open');
    assert(_.mockHandler).to.haveBeenCalledWith();
  });
});
