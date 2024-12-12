import {source} from 'grapevine';
import {
  assert,
  asyncAssert,
  runEnvironment,
  setup,
  should,
  test,
} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cached} from 'gs-tools/export/data';
import {reverse} from 'nabu';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {integerParser} from '../parser/integer-parser';
import {query} from '../selector/query';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {oattr} from './attr';

const $hostValue$ = source(() => new Subject<string | null>());
const $elValue$ = source(() => new Subject<string | null>());
const $shadowValue$ = source(() => new ReplaySubject<string | null>());

const $hostIntegerValue$ = source(() => new Subject<number | null>());
const $elIntegerValue$ = source(() => new Subject<number | null>());
const $shadowIntegerValue$ = source(() => new ReplaySubject<number | null>());

const $host = {
  host: {
    value: oattr('attr'),
    valueInt: oattr('attr-int', reverse(integerParser())),
  },
  shadow: {
    el: query('#el', DIV, {
      value: oattr('attr'),
      valueInt: oattr('attr-int', reverse(integerParser())),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly context: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $hostValue$.get(this.context.vine).pipe(this.context.host.value()),
      $hostIntegerValue$
        .get(this.context.vine)
        .pipe(this.context.host.valueInt()),
      $elValue$.get(this.context.vine).pipe(this.context.shadow.el.value()),
      $elIntegerValue$
        .get(this.context.vine)
        .pipe(this.context.shadow.el.valueInt()),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '<div id="el"></div>',
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
      this.context.shadow.deps.valueInt.pipe(
        tap((value) => $shadowIntegerValue$.get(this.context.vine).next(value)),
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

test('@persona/src/output/attr', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens'));
    const tester = setupTest({roots: [SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('update values correctly', () => {
      const value = 'value';
      const element = _.tester.bootstrapElement(HOST);

      assert(element.getAttribute('attr')).to.beNull();

      $hostValue$.get(_.tester.vine).next(value);
      assert(element.getAttribute('attr')).to.equal(value);

      $hostValue$.get(_.tester.vine).next(null);
      assert(element.hasAttribute('attr')).to.beFalse();
    });

    should('update values with custom parsers correctly', () => {
      const element = _.tester.bootstrapElement(HOST);

      assert(element.getAttribute('attr-int')).to.beNull();

      $hostIntegerValue$.get(_.tester.vine).next(12);
      assert(element.getAttribute('attr-int')).to.equal('12');

      $hostIntegerValue$.get(_.tester.vine).next(null);
      assert(element.hasAttribute('attr-int')).to.beFalse();
    });
  });

  test('el', () => {
    should('update values correctly', async () => {
      const value = 'value';
      const element = _.tester.bootstrapElement(HOST);

      await asyncAssert(snapshotElement(element)).to.match('attr__el_empty');

      $elValue$.get(_.tester.vine).next(value);
      await asyncAssert(snapshotElement(element)).to.match('attr__el_value');

      $elValue$.get(_.tester.vine).next(null);
      await asyncAssert(snapshotElement(element)).to.match('attr__el_reset');
    });

    should('update values with custom parsers correctly', async () => {
      const element = _.tester.bootstrapElement(HOST);

      await asyncAssert(snapshotElement(element)).to.match(
        'attr__el_integer_empty',
      );

      $elIntegerValue$.get(_.tester.vine).next(12);
      await asyncAssert(snapshotElement(element)).to.match(
        'attr__el_integer_value',
      );

      $elIntegerValue$.get(_.tester.vine).next(null);
      await asyncAssert(snapshotElement(element)).to.match(
        'attr__el_integer_reset',
      );
    });
  });

  test('shadow', () => {
    should('update values correctly', async () => {
      const value = 'value';
      _.tester.bootstrapElement(SHADOW);

      $hostValue$.get(_.tester.vine).next(value);
      await asyncAssert($shadowValue$.get(_.tester.vine)).to.emitSequence([
        null,
        value,
      ]);
    });

    should('update values with custom parsers correctly', async () => {
      const value = 12;
      _.tester.bootstrapElement(SHADOW);

      $hostIntegerValue$.get(_.tester.vine).next(value);
      await asyncAssert(
        $shadowIntegerValue$.get(_.tester.vine),
      ).to.emitSequence([null, value]);
    });
  });
});
