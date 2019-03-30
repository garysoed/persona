import { instanceStreamId, staticSourceId } from '@grapevine/component';
import { getOrRegisterApp as getOrRegisterVineApp } from '@grapevine/main';
import { assert, should, test } from '@gs-testing/main';
import { createSpy, Spy } from '@gs-testing/spy';
import { InstanceofType, StringType } from '@gs-types';
import { identity } from '@nabu/util';
import { Observable, of as observableOf } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { element } from '../input/element';
import { attribute } from '../output/attribute';
import { PersonaTester, PersonaTesterFactory } from '../testing/persona-tester';
import { CustomElementCtrl } from './custom-element-ctrl';
import { getOrRegisterApp as getOrRegisterPersonaApp } from './persona';

const _v = getOrRegisterVineApp('test');
const _p = getOrRegisterPersonaApp('test', _v);
const $ = {
  host: element({
    attr1: attribute('attr1', identity()),
    attr2: attribute('attr2', identity()),
  }),
};

const $value = instanceStreamId('value', StringType);
const $handler = staticSourceId('handler', InstanceofType(Function));
_v.builder.source($handler, () => undefined);

@_p.baseCustomElement({
  shadowMode: 'open',
})
class ParentTestClass extends CustomElementCtrl {
  @_p.render($.host._.attr1)
  overriddenRender(_: Observable<string>): Observable<string> {
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
@_p.render($.host._.attr2).withForwarding($value)
class TestClass extends ParentTestClass {
  @_p.onCreate()
  onCreate(
      @_v.vineIn($handler) handlerObs: Observable<Function>,
  ): Observable<unknown> {
    return handlerObs
        .pipe(
            tap(handler => handler()),
        );
  }

  @_p.render($.host._.attr1)
  overriddenRender(
      @_v.vineIn($value) valueObs: Observable<string>,
  ): Observable<string> {
    return valueObs.pipe(map(value => `${value}abc`));
  }

  @_v.vineOut($value)
  providesValue(): Observable<string> {
    return observableOf('123');
  }
}

const testerFactory = new PersonaTesterFactory(_v.builder, _p.builder);

test('persona.main.PersonaBuilder', () => {
  let mockHandler: Spy;
  let tester: PersonaTester;
  let el: HTMLElement;

  beforeEach(() => {
    mockHandler = createSpy('handler');
    tester = testerFactory.build([TestClass]);
    tester.vine.setValue($handler, mockHandler);

    el = tester.createElement('test-el', document.body);
  });

  should(`set up the component correctly`, async () => {
    await assert(tester.getAttribute(el, $.host._.attr1)).to.emitWith('123abc');
    await assert(tester.getAttribute(el, $.host._.attr2)).to.emitWith('123');
    // tslint:disable-next-line:no-non-null-assertion
    assert(el.shadowRoot!.mode).to.equal('open');
    assert(mockHandler).to.haveBeenCalledWith();
  });
});
