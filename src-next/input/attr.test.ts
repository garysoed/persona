import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {Observable, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {iattr} from './attr';


const $hostValue$ = source(() => new ReplaySubject<string|null>());
// const $shadowValue$ = source(() => new Subject<string|null>());
// const $shadowValueWithDefault$ = source(() => new Subject<string|null>());


const $host = {
  host: {
    value: iattr('attr'),
    valueWithDefault: iattr('attr-default'),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.host.value.pipe(
          tap(value => $hostValue$.get(this.context.vine).next(value)),
      ),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '',
});

// const $shadow = {
//   shadow: {
//     deps: id('deps', HOST),
//   },
// };

// class ShadowCtrl implements Ctrl {
//   constructor(private readonly context: Context<typeof $shadow>) {}

//   @cache()
//   get runs(): ReadonlyArray<Observable<unknown>> {
//     return [
//       this.context.shadow.deps.value.pipe(
//           tap(value => $shadowValue$.get(this.context.vine).next(value)),
//       ),
//       this.context.shadow.deps.valueWithDefault.pipe(
//           tap(value => $shadowValueWithDefault$.get(this.context.vine).next(value)),
//       ),
//     ];
//   }
// }

// const SHADOW = registerCustomElement({
//   tag: 'test-shadow',
//   ctrl: ShadowCtrl,
//   spec: $shadow,
//   template: '<test-host id="deps"></test-host>',
//   deps: [HOST],
// });


test('@persona/src/input/attr', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('host', () => {
    should('emit values on sets', () => {
      const value = 'value';
      const element = _.tester.createElement(HOST);
      element.setAttribute('attr', value);
      element.removeAttribute('attr');

      assert($hostValue$.get(_.tester.vine)).to.emitSequence([null, value, null]);
    });
  });


  // test('shadow', () => {
  //   should.only('update values correctly if default value is given', () => {
  //     const value = 'value';
  //     _.tester.createElement(SHADOW);

  //     $hostValueWithDefault$.get(_.tester.vine).next(value);
  //     assert($shadowValueWithDefault$.get(_.tester.vine)).to.emitSequence([DEFAULT_VALUE, value]);
  //   });

  //   should.only('update values correctly if default value is not given', () => {
  //     const value = 'value';
  //     _.tester.createElement(SHADOW);

  //     $hostValue$.get(_.tester.vine).next(value);
  //     assert($shadowValue$.get(_.tester.vine)).to.emitSequence([null, value]);
  //   });
  // });
});