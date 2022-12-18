import {source} from 'grapevine';
import {assert, runEnvironment, should, test, setup} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cache} from 'gs-tools/export/data';
import {Observable, Subject, ReplaySubject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {query} from '../selector/query';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {otext} from './text';


const $hostValue$ = source(() => new Subject<string>());
const $elValue$ = source(() => new Subject<string>());
const $rootValue$ = source(() => new Subject<string>());
const $shadowValue$ = source(() => new ReplaySubject<string>());


const $host = {
  host: {
    value: otext(),
  },
  shadow: {
    root: root({
      value: otext(),
    }),
    el: query('#el', DIV, {
      value: otext(),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $hostValue$.get(this.$.vine).pipe(this.$.host.value()),
      $elValue$.get(this.$.vine).pipe(this.$.shadow.el.value()),
      $rootValue$.get(this.$.vine).pipe(this.$.shadow.root.value()),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: `
  <!-- #root -->
  <div id="el">
    <!-- #ref -->
    other
  </div>`,
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
      this.context.shadow.deps.value.pipe(
          tap(value => $shadowValue$.get(this.context.vine).next(value)),
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


test('@persona/src/output/text', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens', goldens));
    const tester = setupTest({roots: [HOST, SHADOW]});
    return {tester};
  });

  test('host', () => {
    should('set the text content correctly with a single emission', () => {
      const element = _.tester.bootstrapElement(HOST);
      $hostValue$.get(_.tester.vine).next('text');

      assert(snapshotElement(element)).to.match('text__host.golden');
    });

    should('set the text content correctly with multiple emissions', () => {
      const element = _.tester.bootstrapElement(HOST);
      $hostValue$.get(_.tester.vine).next('text');
      $hostValue$.get(_.tester.vine).next('text');

      assert(snapshotElement(element)).to.match('text__host-double.golden');
    });
  });

  test('el', () => {
    should('set the text content correctly with a single emission', () => {
      const element = _.tester.bootstrapElement(HOST);
      $elValue$.get(_.tester.vine).next('text');

      assert(snapshotElement(element)).to.match('text__el.golden');
    });

    should('set the text content correctly with multiple emissions', () => {
      const element = _.tester.bootstrapElement(HOST);
      $elValue$.get(_.tester.vine).next('text');
      $elValue$.get(_.tester.vine).next('text');

      assert(snapshotElement(element)).to.match('text__el-double.golden');
    });
  });

  test('root', () => {
    should('set the text content correctly with a single emission', () => {
      const element = _.tester.bootstrapElement(HOST);
      $rootValue$.get(_.tester.vine).next('text');

      assert(snapshotElement(element)).to.match('text__root.golden');
    });

    should('set the text content correctly with multiple emissions', () => {
      const element = _.tester.bootstrapElement(HOST);
      $rootValue$.get(_.tester.vine).next('text');
      $rootValue$.get(_.tester.vine).next('text');

      assert(snapshotElement(element)).to.match('text__root-double.golden');
    });
  });

  test('shadow', () => {
    should('set the text content correctly with a single emission', () => {
      _.tester.bootstrapElement(SHADOW);

      const text = 'text';
      $hostValue$.get(_.tester.vine).next(text);

      assert($shadowValue$.get(_.tester.vine)).to.emitSequence(['', text]);
    });
  });
});
