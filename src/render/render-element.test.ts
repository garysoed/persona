import {source} from 'grapevine';
import {asyncAssert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cached} from 'gs-tools/export/data';
import {numberType} from 'gs-types';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {BUTTON} from '../html/button';
import {iattr} from '../input/attr';
import {iflag} from '../input/flag';
import {ocase} from '../output/case';
import {otext} from '../output/text';
import {ovalue} from '../output/value';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {renderElement} from './types/render-element-spec';
import {RenderSpec} from './types/render-spec';

const DEFAULT_C = 123;
const $child = {
  host: {
    a: iattr('a'),
    b: iflag('b'),
    c: ovalue('c', numberType, () => DEFAULT_C),
  },
};

const $c = source(() => new Subject<number>());

class Child implements Ctrl {
  constructor(private readonly $: Context<typeof $child>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [$c.get(this.$.vine).pipe(this.$.host.c())];
  }
}

const CHILD = registerCustomElement({
  ctrl: Child,
  spec: $child,
  tag: 'pr-test',
  template: '<div>child<slot></slot></div>',
});

const $spec = source(() => new Subject<RenderSpec | null>());
const $host = {
  shadow: {
    root: root({
      value: ocase<RenderSpec | null>('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cached()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $spec.get(this.$.vine).pipe(this.$.shadow.root.value((spec) => spec)),
    ];
  }
}

const HOST = registerCustomElement({
  ctrl: HostCtrl,
  spec: $host,
  tag: 'test-host',
  template: '<!-- #ref -->',
});

test('@persona/src/render/render-element', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens'));
    const tester = setupTest({roots: [HOST, CHILD]});
    return {tester};
  });

  should('emit the custom element', async () => {
    const element = _.tester.bootstrapElement(HOST);
    $spec.get(_.tester.vine).next(
      renderElement({
        registration: CHILD,
        runs: ($) => [of('avalue').pipe($.a()), of(true).pipe($.b())],
        spec: {},
      }),
    );

    await asyncAssert(snapshotElement(element)).to.match(
      'render-element__emit',
    );
  });

  should('update the inputs', async () => {
    const element = _.tester.bootstrapElement(HOST);
    $spec.get(_.tester.vine).next(
      renderElement({
        registration: CHILD,
        runs: ($) => [of('a1', 'a2').pipe($.a()), of(true, false).pipe($.b())],
        spec: {},
      }),
    );

    await asyncAssert(snapshotElement(element)).to.match(
      'render-element__update',
    );
  });

  should('work with DOM elements', async () => {
    const element = _.tester.bootstrapElement(HOST);
    $spec.get(_.tester.vine).next(
      renderElement({
        registration: BUTTON,
        runs: ($) => [
          of(true).pipe($.autofocus()),
          of('button').pipe($.text()),
        ],
        spec: {
          text: otext(),
        },
      }),
    );

    await asyncAssert(snapshotElement(element)).to.match('render-element__dom');
  });
});
