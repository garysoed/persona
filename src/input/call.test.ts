import {source} from 'grapevine';
import {arrayThat, assert, createSpySubject, fake, should, spy, test, setup} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {numberType} from 'gs-types';
import {BehaviorSubject, Observable, ReplaySubject, Subject} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {query} from '../selector/query';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';
import {setValueObservable} from '../util/value-observable';

import {icall} from './call';


const $hostValue$ = source(() => new ReplaySubject<number>());
const $shadowValue$ = source(() => new Subject<number>());

const $host = {
  host: {
    fn: icall('callFn', [numberType]),
  },
};

class HostCtrl implements Ctrl {
  constructor(
      private readonly context: Context<typeof $host>,
  ) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.host.fn.pipe(
          tap(([value]) => $hostValue$.get(this.context.vine).next(value)),
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
      $shadowValue$.get(this.context.vine).pipe(
          map(value => [value]),
          this.context.shadow.deps.fn(),
      ),
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


test('@persona/src/input/call', () => {
  const _ = setup(() => {
    const tester = setupTest({
      roots: [SHADOW],
    });

    return {tester};
  });

  test('host', () => {
    should('emit values on calls', () => {
      const value = 2;
      const element = _.tester.bootstrapElement(HOST);
      element.callFn(value);

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([value]);
    });
  });

  test('shadow', () => {
    should('emit values on calls', () => {
      const value = 2;
      _.tester.bootstrapElement(SHADOW);
      $shadowValue$.get(_.tester.vine).next(value);

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([value]);
    });
  });

  should('emit values if target is not initialized on time', async () => {
    const onWhenDefined$ = new Subject<CustomElementConstructor>();
    fake(spy(window.customElements, 'whenDefined')).always()
        .return(onWhenDefined$ as any);

    const key = 'key';
    const input = icall(key, [numberType]);
    const tag = 'tag';
    const target = document.createElement(tag);
    const value$ = createSpySubject(input.resolve(target));

    const value = 123;
    const valueSubject = new BehaviorSubject([value]);
    setValueObservable(target, key, valueSubject);
    onWhenDefined$.next(HTMLElement);

    assert(value$).to.emitSequence([arrayThat<number>().haveExactElements([value])]);
  });
});