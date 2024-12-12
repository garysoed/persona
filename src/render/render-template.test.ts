import {source} from 'grapevine';
import {asyncAssert, runEnvironment, setup, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv, snapshotElement} from 'gs-testing/export/snapshot';
import {cached} from 'gs-tools/export/data';
import {forwardTo} from 'gs-tools/export/rxjs';
import {BehaviorSubject, Observable, of, ReplaySubject, Subject} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {DIV} from '../html/div';
import {iattr} from '../input/attr';
import {ocase} from '../output/case';
import {otext} from '../output/text';
import {query} from '../selector/query';
import {root} from '../selector/root';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import {RenderSpec} from './types/render-spec';
import {renderTemplate} from './types/render-template-spec';

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

test('@persona/src/render/render-template', () => {
  const _ = setup(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens'));
    const tester = setupTest({roots: [HOST]});

    const templateEl = document.createElement('template');
    const divEl = document.createElement('div');
    divEl.setAttribute('attr', 'value');
    templateEl.content.appendChild(divEl);
    return {templateEl, tester};
  });

  should('emit the custom element', async () => {
    const element = _.tester.bootstrapElement(HOST);
    const text$ = new BehaviorSubject<string>('text');
    const attr$ = new ReplaySubject<string | null>();
    $spec.get(_.tester.vine).next(
      renderTemplate({
        runs: ($) => {
          return [text$.pipe($.div.text()), $.div.attr.pipe(forwardTo(attr$))];
        },
        spec: {
          div: query('div', DIV, {
            attr: iattr('attr'),
            text: otext(),
          }),
        },
        template$: of(_.templateEl),
      }),
    );

    await asyncAssert(snapshotElement(element)).to.match(
      'render-template__emit',
    );
    await asyncAssert(attr$).to.emitSequence(['value']);
  });

  should('update the inputs', async () => {
    const element = _.tester.bootstrapElement(HOST);
    const text$ = new BehaviorSubject<string>('text');
    const attr$ = new ReplaySubject<string | null>();
    $spec.get(_.tester.vine).next(
      renderTemplate({
        runs: ($) => {
          return [text$.pipe($.div.text()), $.div.attr.pipe(forwardTo(attr$))];
        },
        spec: {
          div: query('div', DIV, {
            attr: iattr('attr'),
            text: otext(),
          }),
        },
        template$: of(_.templateEl),
      }),
    );

    const newValue = 'newValue';
    element.shadowRoot!.querySelector('div')?.setAttribute('attr', newValue);
    await asyncAssert(attr$).to.emitSequence(['value', newValue]);
  });

  should('update the outputs', async () => {
    const element = _.tester.bootstrapElement(HOST);
    const text$ = new BehaviorSubject<string>('text');
    const attr$ = new ReplaySubject<string | null>();
    $spec.get(_.tester.vine).next(
      renderTemplate({
        runs: ($) => {
          return [text$.pipe($.div.text()), $.div.attr.pipe(forwardTo(attr$))];
        },
        spec: {
          div: query('div', DIV, {
            attr: iattr('attr'),
            text: otext(),
          }),
        },
        template$: of(_.templateEl),
      }),
    );

    text$.next('new text');

    await asyncAssert(snapshotElement(element)).to.match(
      'render-template__update-output',
    );
  });
});
