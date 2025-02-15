import {source} from 'grapevine';
import {assert, asyncAssert, fake, setup, should, spy, test} from 'gs-testing';
import {cached} from 'gs-tools/export/data';
import {numberType} from 'gs-types';
import {Observable, of, ReplaySubject, Subject} from 'rxjs';
import {take, tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {query} from '../selector/query';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';
import {setValueObservable} from '../util/value-observable';

import {ovalue} from './value';

const $hostValue$ = source(() => new Subject<number | undefined>());
const $hostValueWithDefault$ = source(() => new Subject<number>());
const $shadowValue$ = source(() => new ReplaySubject<number | undefined>());
const $shadowValueWithDefault$ = source(() => new ReplaySubject<number>());

const DEFAULT_VALUE = 3;

const $host = {
  host: {
    value: ovalue('valueProp', numberType),
    valueWithDefault: ovalue(
      'valueWithDefaultProp',
      numberType,
      () => DEFAULT_VALUE,
    ),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $hostValue$.get(this.context.vine).pipe(this.context.host.value()),
      $hostValueWithDefault$
        .get(this.context.vine)
        .pipe(this.context.host.valueWithDefault()),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '',
});

const $shadow = {
  shadow: {
    deps: query('#deps', HOST),
  },
};

class ShadowCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $shadow>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.shadow.deps.value.pipe(
        tap((value) => $shadowValue$.get(this.context.vine).next(value)),
      ),
      this.context.shadow.deps.valueWithDefault.pipe(
        tap((value) =>
          $shadowValueWithDefault$.get(this.context.vine).next(value),
        ),
      ),
    ];
  }
}

const SHADOW = registerCustomElement({
  ctrl: ShadowCtrl,
  deps: [HOST],
  spec: $shadow,
  tag: 'test-shadow',
  template: '<test-host id="deps"></test-host>',
});

test('@persona/src/output/value', () => {
  const _ = setup(() => {
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('update values correctly if the default value is given', () => {
      const value = 2;
      const element = _.tester.bootstrapElement(HOST);

      assert(element.valueWithDefaultProp).to.equal(DEFAULT_VALUE);

      $hostValueWithDefault$.get(_.tester.vine).next(value);
      assert(element.valueWithDefaultProp).to.equal(value);
    });

    should('update values correctly if the default value is not given', () => {
      const value = 2;
      const element = _.tester.bootstrapElement(HOST);

      assert(element.valueProp).toNot.beDefined();

      $hostValue$.get(_.tester.vine).next(value);
      assert(element.valueProp).to.equal(value);
    });
  });

  test('shadow', () => {
    should(
      'update values correctly if the default value is given',
      async () => {
        const value = 2;
        _.tester.bootstrapElement(SHADOW);

        $hostValueWithDefault$.get(_.tester.vine).next(value);
        await asyncAssert(
          $shadowValueWithDefault$.get(_.tester.vine),
        ).to.emitSequence([DEFAULT_VALUE, value]);
      },
    );

    should(
      'update values correctly if the default value is not given',
      async () => {
        const value = 2;
        _.tester.bootstrapElement(SHADOW);

        $hostValue$.get(_.tester.vine).next(value);
        await asyncAssert($shadowValue$.get(_.tester.vine)).to.emitSequence([
          undefined,
          value,
        ]);
      },
    );
  });

  should(
    'update values correctly if target is not initialized on time',
    async () => {
      const onWhenDefined$ = new Subject<CustomElementConstructor>();
      fake(spy(window.customElements, 'whenDefined'))
        .always()
        .return(onWhenDefined$ as any);

      const key = 'key';
      const output = ovalue(key, numberType);
      const tag = 'tag';
      const target = document.createElement(tag);

      const value = 123;
      const onUpdate = of(456, value)
        .pipe(output.resolve(target)(), take(1))
        .toPromise();

      const value$ = new ReplaySubject();
      setValueObservable(target, key, value$);
      onWhenDefined$.next(HTMLElement);

      await onUpdate;

      await asyncAssert(value$).to.emitSequence([value]);
    },
  );
});
