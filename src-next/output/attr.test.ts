import {source} from 'grapevine';
import {assert, should, test} from 'gs-testing';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {oattr} from './attr';


const $hostValue$ = source(() => new Subject<string|null>());
const $hostValueWithDefault$ = source(() => new Subject<string|null>());
// const $shadowValue$ = source(() => new ReplaySubject<string|null>());
// const $shadowValueWithDefault$ = source(() => new ReplaySubject<string|null>());


const DEFAULT_VALUE = 'DEFAULT_VALUE';

const $host = {
  host: {
    value: oattr('attr'),
    valueWithDefault: oattr('attr-default', DEFAULT_VALUE),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $hostValue$.get(this.context.vine).pipe(this.context.host.value()),
      $hostValueWithDefault$.get(this.context.vine).pipe(this.context.host.valueWithDefault()),
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


test('@persona/src/output/attr', init => {
  const _ = init(() => {
    const tester = setupTest({roots: [HOST]});
    return {tester};
  });

  test('host', () => {
    should('update values correctly if default value is given', () => {
      const value = 'value';
      const element = _.tester.createElement(HOST);

      assert(element.getAttribute('attr-default')).to.equal(DEFAULT_VALUE);

      $hostValueWithDefault$.get(_.tester.vine).next(value);
      assert(element.getAttribute('attr-default')).to.equal(value);

      $hostValueWithDefault$.get(_.tester.vine).next(null);
      assert(element.hasAttribute('attr-default')).to.beFalse();
    });

    should('update values correctly if default value is not given', () => {
      const value = 'value';
      const element = _.tester.createElement(HOST);

      assert(element.getAttribute('attr')).to.beNull();

      $hostValue$.get(_.tester.vine).next(value);
      assert(element.getAttribute('attr')).to.equal(value);

      $hostValue$.get(_.tester.vine).next(null);
      assert(element.hasAttribute('attr')).to.beFalse();
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