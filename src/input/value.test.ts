import {source} from 'grapevine';
import {assert, createSpySubject, fake, should, spy, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {nullType, numberType, unionType} from 'gs-types';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {query} from '../selector/query';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';
import {setValueObservable} from '../util/value-observable';

import {ivalue} from './value';


const $hostValue$ = source(() => new ReplaySubject<number|null|undefined>());
const $hostValueWithDefault$ = source(() => new ReplaySubject<number|null>());
const $shadowValue$ = source(() => new Subject<number|null|undefined>());
const $shadowValueWithDefault$ = source(() => new Subject<number|null>());

const DEFAULT_VALUE = 3;
const VALUE_TYPE = unionType([numberType, nullType]);

const $host = {
  host: {
    value: ivalue('valueProp', VALUE_TYPE),
    valueWithDefault: ivalue('valueWithDefaultProp', VALUE_TYPE, DEFAULT_VALUE),
  },
};


class HostCtrl implements Ctrl {
  constructor(
      private readonly context: Context<typeof $host>,
  ) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.host.value.pipe(
          tap(value => $hostValue$.get(this.context.vine).next(value)),
      ),
      this.context.host.valueWithDefault.pipe(
          tap(value => $hostValueWithDefault$.get(this.context.vine).next(value)),
      ),
    ];
  }
}

const HOST = registerCustomElement<typeof $host>({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '',
});

const $shadow = {
  shadow: {
    deps: query('#deps', HOST),
  },
};

class ShadowCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $shadow>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $shadowValue$.get(this.context.vine).pipe(this.context.shadow.deps.value()),
      $shadowValueWithDefault$.get(this.context.vine)
          .pipe(this.context.shadow.deps.valueWithDefault()),
    ];
  }
}

const SHADOW = registerCustomElement({
  tag: 'test-shadow',
  ctrl: ShadowCtrl,
  spec: $shadow,
  template: '<test-host id="deps"></test-host>',
  deps: [HOST],
});


test('@persona/src/input/value', init => {
  const _ = init(() => {
    const tester = setupTest({
      roots: [SHADOW],
    });

    return {tester};
  });

  test('host', () => {
    should('emit values on sets when default values are given', () => {
      const value = 2;
      const element = _.tester.bootstrapElement(HOST);
      element.valueWithDefaultProp = value;

      assert($hostValueWithDefault$.get(_.tester.vine)).to.emitSequence([DEFAULT_VALUE, value]);
    });

    should('emit values on sets when default values aren\'t given', () => {
      const value = 2;
      const element = _.tester.bootstrapElement(HOST);
      element.valueProp = value;
      element.valueProp = undefined;

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([undefined, value, undefined]);
    });

    should('handle null values', () => {
      const element = _.tester.bootstrapElement(HOST);
      element.valueProp = null;
      element.valueProp = undefined;

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([undefined, null, undefined]);
    });
  });

  test('shadow', () => {
    should('emit values on sets when default values are given', () => {
      const value = 2;
      _.tester.bootstrapElement(SHADOW);
      $shadowValueWithDefault$.get(_.tester.vine).next(value);

      assert($hostValueWithDefault$.get(_.tester.vine)).to.emitSequence([DEFAULT_VALUE, value]);
    });

    should('emit values on sets when default values aren\'t given', () => {
      const value = 2;
      _.tester.bootstrapElement(SHADOW);
      $shadowValue$.get(_.tester.vine).next(value);
      $shadowValue$.get(_.tester.vine).next(undefined);

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([undefined, value, undefined]);
    });

    should('handle null values', () => {
      _.tester.bootstrapElement(SHADOW);
      $shadowValue$.get(_.tester.vine).next(null);
      $shadowValue$.get(_.tester.vine).next(undefined);

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([undefined, null, undefined]);
    });
  });

  should('emit values if target is not initialized on time', async () => {
    const onWhenDefined$ = new Subject<CustomElementConstructor>();
    fake(spy(window.customElements, 'whenDefined')).always()
        .return(onWhenDefined$ as any);

    const key = 'key';
    const input = ivalue(key, numberType);
    const tag = 'tag';
    const target = document.createElement(tag);
    const value$ = createSpySubject(input.resolve(target));

    const value = 123;
    const valueSubject = new BehaviorSubject(value);
    setValueObservable(target, key, valueSubject);
    onWhenDefined$.next(HTMLElement);

    assert(value$).to.emitSequence([value]);
  });
});