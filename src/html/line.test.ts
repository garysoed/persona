import {source} from 'grapevine';
import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {Observable, Subject, of} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {ocase} from '../output/case';
import {renderElement} from '../render/types/render-element-spec';
import {RenderSpec} from '../render/types/render-spec';
import {query} from '../selector/query';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {LINE, LineCap} from './line';
import {SVG} from './svg';

const $renderSpec$ = source(() => new Subject<RenderSpec>());

const $test = {
  shadow: {
    svg: query('svg', SVG, {
      content: ocase(),
    }),
  },
};

class TestElement implements Ctrl {
  constructor(private readonly $: Context<typeof $test>) {}

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      $renderSpec$.get(this.$.vine).pipe(this.$.shadow.svg.content(spec => spec)),
    ];
  }
}

const TEST = registerCustomElement({
  tag: 'ps-test',
  ctrl: TestElement,
  spec: $test,
  template: '<svg></svg>',
});

test('@persona/src/html/line', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/html/goldens', goldens));

    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  should('render the line correctly', () => {
    const element = _.tester.createElement(TEST);
    $renderSpec$.get(_.tester.vine).next(renderElement({
      registration: LINE,
      spec: {},
      runs: $ => [
        of(10).pipe($.x1()),
        of(60).pipe($.x2()),
        of(20).pipe($.y1()),
        of(50).pipe($.y2()),
        of('green').pipe($.stroke()),
        of([10, 10]).pipe($.strokeDasharray()),
        of(LineCap.ROUND).pipe($.strokeLinecap()),
        of(.5).pipe($.strokeOpacity()),
        of(5).pipe($.strokeWidth()),
      ],
    }));
    assert(element).to.matchSnapshot('line.html');
  });
});