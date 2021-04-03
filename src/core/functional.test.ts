import {source} from 'grapevine';
import {assert, createSpy, should, test} from 'gs-testing';
import {identity} from 'nabu';
import {Observable, of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

import {attribute as attributeIn} from '../input/attribute';
import {attribute as attributeOut} from '../output/attribute';
import {host} from '../selector/host';
import {PersonaTesterFactory} from '../testing/persona-tester';

import {BaseCtrl} from './base-ctrl';
import {Builder as PersonaBuilder} from './builder';
import {ShadowContext} from './shadow-context';


const _p = new PersonaBuilder();

const $$ = {
  tag: 'test-el',
  api: {
    attr3: attributeIn('attr3', identity(), ''),
  },
};

const $p = {
  host: host({
    ...$$.api,
    attr1: attributeOut('attr1', identity()),
  }),
};

const $ = {
  host: host({
    ...$$.api,
    attr1: attributeOut('attr1', identity()),
    attr2: attributeOut('attr2', identity()),
  }),
};

const $HANDLER = source('handler', () => () => undefined);

@_p.baseCustomElement({
  shadowMode: 'open',
})
abstract class ParentTestClass<S extends typeof $p> extends BaseCtrl<S> {
  constructor(context: ShadowContext, specs: S) {
    super(context, specs);
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
class TestClass extends ParentTestClass<typeof $> {
  constructor(context: ShadowContext) {
    super(context, $);
    this.setupHandler();
  }

  protected overriddenRender(): Observable<string> {
    return this.providesValue()
        .pipe(map(value => `${value}abc`));
  }

  private providesValue(): Observable<string> {
    return this.inputs.host.attr3.pipe(map(v => `123-${v}`));
  }

  private setupHandler(): void {
    $HANDLER.get(this.vine)();
  }

  get renders(): ReadonlyArray<Observable<unknown>> {
    return [
      this.renderers.host.attr1(this.overriddenRender()),
      this.renderers.host.attr2(this.overriddenRender()),
    ];
  }
}

const testerFactory = new PersonaTesterFactory(_p);

test('@persona/core/functional', init => {
  const _ = init(() => {
    const mockHandler = createSpy<undefined, []>('handler');
    const tester = testerFactory.build({
      overrides: [
        {override: $HANDLER, withValue: mockHandler},
      ],
      rootCtrls: [TestClass],
      rootDoc: document,
    });

    const el = tester.createElement('test-el');
    return {el, tester, mockHandler};
  });

  should('set up the component correctly', () => {
    assert(_.el.getAttribute($.host._.attr1)).to.emitWith('123-abc');
    assert(_.el.getAttribute($.host._.attr2)).to.emitWith('123-abc');

    assert(_.el.element.shadowRoot?.mode).to.equal('open');
    assert(_.mockHandler).to.haveBeenCalledWith();
  });
});
