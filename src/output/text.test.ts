import {source} from 'grapevine';
import {asyncAssert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cached} from 'gs-tools/export/data';
import {Observable, ReplaySubject, Subject} from 'rxjs';
import {tap} from 'rxjs/operators';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {query} from '../selector/query';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

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
    el: query('#el', DIV, {
      value: otext(),
    }),
    root: root({
      value: otext(),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $hostValue$.get(this.$.vine).pipe(this.$.host.value()),
      $elValue$.get(this.$.vine).pipe(this.$.shadow.el.value()),
      $rootValue$.get(this.$.vine).pipe(this.$.shadow.root.value()),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
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

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      this.context.shadow.deps.value.pipe(
        tap((value) => $shadowValue$.get(this.context.vine).next(value)),
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

test('@persona/src/output/text', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/output/goldens'));
    const tester = setupTest({roots: [HOST, SHADOW]});
    return {tester};
  });

  test('host', () => {
    should(
      'set the text content correctly with a single emission',
      async () => {
        const element = _.tester.bootstrapElement(HOST);
        $hostValue$.get(_.tester.vine).next('text');

        await asyncAssert(snapshotElement(element)).to.match('text__host');
      },
    );

    should(
      'set the text content correctly with multiple emissions',
      async () => {
        const element = _.tester.bootstrapElement(HOST);
        $hostValue$.get(_.tester.vine).next('text');
        $hostValue$.get(_.tester.vine).next('text');

        await asyncAssert(snapshotElement(element)).to.match(
          'text__host-double',
        );
      },
    );
  });

  test('el', () => {
    should(
      'set the text content correctly with a single emission',
      async () => {
        const element = _.tester.bootstrapElement(HOST);
        $elValue$.get(_.tester.vine).next('text');

        await asyncAssert(snapshotElement(element)).to.match('text__el');
      },
    );

    should(
      'set the text content correctly with multiple emissions',
      async () => {
        const element = _.tester.bootstrapElement(HOST);
        $elValue$.get(_.tester.vine).next('text');
        $elValue$.get(_.tester.vine).next('text');

        await asyncAssert(snapshotElement(element)).to.match('text__el-double');
      },
    );
  });

  test('root', () => {
    should(
      'set the text content correctly with a single emission',
      async () => {
        const element = _.tester.bootstrapElement(HOST);
        $rootValue$.get(_.tester.vine).next('text');

        await asyncAssert(snapshotElement(element)).to.match('text__root');
      },
    );

    should(
      'set the text content correctly with multiple emissions',
      async () => {
        const element = _.tester.bootstrapElement(HOST);
        $rootValue$.get(_.tester.vine).next('text');
        $rootValue$.get(_.tester.vine).next('text');

        await asyncAssert(snapshotElement(element)).to.match(
          'text__root-double',
        );
      },
    );
  });

  test('shadow', () => {
    should(
      'set the text content correctly with a single emission',
      async () => {
        _.tester.bootstrapElement(SHADOW);

        const text = 'text';
        $hostValue$.get(_.tester.vine).next(text);

        await asyncAssert($shadowValue$.get(_.tester.vine)).to.emitSequence([
          '',
          text,
        ]);
      },
    );
  });
});
