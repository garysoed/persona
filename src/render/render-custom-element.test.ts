import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
import {numberType, unknownType} from 'gs-types';
import {Observable, of, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {iattr} from '../input/attr';
import {iflag} from '../input/flag';
import {ocase} from '../output/case';
import {ovalue} from '../output/value';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {renderCustomElement} from './types/render-custom-element-spec';
import {RenderSpec} from './types/render-spec';


const DEFAULT_C = 123;
const $child = {
  host: {
    a: iattr('a'),
    b: iflag('b'),
    c: ovalue('c', numberType, DEFAULT_C),
  },
};

const $c = source(() => new Subject<number>());

class Child implements Ctrl {
  constructor(private readonly $: Context<typeof $child>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $c.get(this.$.vine).pipe(this.$.host.c()),
    ];
  }
}

const CHILD = registerCustomElement({
  tag: 'pr-test',
  ctrl: Child,
  spec: $child,
  template: '<div>child<slot></slot></div>',
});

const $spec = source(() => new Subject<RenderSpec|null>());
const $host = {
  shadow: {
    root: root({
      value: ocase('#ref', unknownType),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      of({}).pipe(this.$.shadow.root.value(() => $spec.get(this.$.vine))),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<!-- #ref -->',
});

test('@persona/src/render/render-custom-element', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const tester = setupTest({roots: [HOST, CHILD]});
    return {tester};
  });

  should('emit the custom element', () => {
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderCustomElement({
      registration: CHILD,
      runs: $ => [
        of('avalue').pipe($.a()),
        of(true).pipe($.b()),
      ],
    }));

    assert(element).to.matchSnapshot('render-custom-element__emit.html');
  });

  should('update the inputs', () => {
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderCustomElement({
      registration: CHILD,
      runs: $ => [
        of('a1', 'a2').pipe($.a()),
        of(true, false).pipe($.b()),
      ],
    }));

    assert(element).to.matchSnapshot('render-custom-element__update.html');
  });
});
