import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {cache} from 'gs-tools/export/data';
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

import goldens from './goldens/goldens.json';
import {RenderSpec} from './types/render-spec';
import {renderTemplate} from './types/render-template-spec';


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

test('@persona/src/render/render-template', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/render/goldens', goldens));
    const tester = setupTest({roots: [HOST]});

    const templateEl = document.createElement('template');
    const divEl = document.createElement('div');
    divEl.setAttribute('attr', 'value');
    templateEl.content.appendChild(divEl);
    return {templateEl, tester};
  });

  should('emit the custom element', () => {
    const element = _.tester.bootstrapElement(HOST);
    const text$ = new BehaviorSubject<string>('text');
    const attr$ = new ReplaySubject<string|null>();
    $spec.get(_.tester.vine).next(renderTemplate({
      template$: of(_.templateEl),
      spec: {
        div: query('div', DIV, {
          text: otext(),
          attr: iattr('attr'),
        }),
      },
      runs: $ => {
        return [
          text$.pipe($.div.text()),
          $.div.attr.pipe(forwardTo(attr$)),
        ];
      },
    }));

    assert(element).to.matchSnapshot('render-template__emit.html');
    assert(attr$).to.emitSequence(['value']);
  });

  should('update the inputs', () => {
    const element = _.tester.bootstrapElement(HOST);
    const text$ = new BehaviorSubject<string>('text');
    const attr$ = new ReplaySubject<string|null>();
    $spec.get(_.tester.vine).next(renderTemplate({
      template$: of(_.templateEl),
      spec: {
        div: query('div', DIV, {
          text: otext(),
          attr: iattr('attr'),
        }),
      },
      runs: $ => {
        return [
          text$.pipe($.div.text()),
          $.div.attr.pipe(forwardTo(attr$)),
        ];
      },
    }));

    const newValue = 'newValue';
    element.shadowRoot!.querySelector('div')?.setAttribute('attr', newValue);
    assert(attr$).to.emitSequence(['value', newValue]);
  });

  should('update the outputs', () => {
    const element = _.tester.bootstrapElement(HOST);
    const text$ = new BehaviorSubject<string>('text');
    const attr$ = new ReplaySubject<string|null>();
    $spec.get(_.tester.vine).next(renderTemplate({
      template$: of(_.templateEl),
      spec: {
        div: query('div', DIV, {
          text: otext(),
          attr: iattr('attr'),
        }),
      },
      runs: $ => {
        return [
          text$.pipe($.div.text()),
          $.div.attr.pipe(forwardTo(attr$)),
        ];
      },
    }));

    text$.next('new text');

    assert(element).to.matchSnapshot('render-template__update-output.html');
  });
});
