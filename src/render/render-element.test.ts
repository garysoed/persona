import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
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

import goldens from './goldens/goldens.json';
import {renderElement} from './types/render-element-spec';
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
      value: ocase<RenderSpec|null>('#ref'),
    }),
  },
};

class HostCtrl implements Ctrl {
  constructor(private readonly $: Context<typeof $host>) {}

  @cache()
  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $spec.get(this.$.vine).pipe(this.$.shadow.root.value(spec => spec)),
    ];
  }
}

const HOST = registerCustomElement({
  tag: 'test-host',
  ctrl: HostCtrl,
  spec: $host,
  template: '<!-- #ref -->',
});

test('@persona/src/render/render-element', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const tester = setupTest({roots: [HOST, CHILD]});
    return {tester};
  });

  should('emit the custom element', () => {
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderElement({
      registration: CHILD,
      spec: {},
      runs: $ => [
        of('avalue').pipe($.a()),
        of(true).pipe($.b()),
      ],
    }));

    assert(element).to.matchSnapshot('render-element__emit.html');
  });

  should('update the inputs', () => {
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderElement({
      registration: CHILD,
      spec: {},
      runs: $ => [
        of('a1', 'a2').pipe($.a()),
        of(true, false).pipe($.b()),
      ],
    }));

    assert(element).to.matchSnapshot('render-element__update.html');
  });

  should('work with DOM elements', () => {
    const element = _.tester.createElement(HOST);
    $spec.get(_.tester.vine).next(renderElement({
      registration: BUTTON,
      spec: {
        text: otext(),
      },
      runs: $ => [
        of(true).pipe($.autofocus()),
        of('button').pipe($.text()),
      ],
    }));

    assert(element).to.matchSnapshot('render-element__dom.html');
  });
});
