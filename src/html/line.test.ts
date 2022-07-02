import {assert, runEnvironment, should, test} from 'gs-testing';
import {BrowserSnapshotsEnv} from 'gs-testing/export/browser';
import {Observable, of} from 'rxjs';

import {registerCustomElement} from '../core/register-custom-element';
import {query} from '../selector/query';
import {setupTest} from '../testing/setup-test';
import {Context, Ctrl} from '../types/ctrl';

import goldens from './goldens/goldens.json';
import {LINE} from './line';

const $test = {
  shadow: {
    line: query('line', LINE, {}),
  },
};

class TestElement implements Ctrl {
  constructor(private readonly $: Context<typeof $test>) {}

  get runs(): ReadonlyArray<Observable<unknown>> {
    return [
      of(10).pipe(this.$.shadow.line.x1()),
      of(60).pipe(this.$.shadow.line.x2()),
      of(20).pipe(this.$.shadow.line.y1()),
      of(50).pipe(this.$.shadow.line.y2()),
      of('green').pipe(this.$.shadow.line.stroke()),
      of([10, 10]).pipe(this.$.shadow.line.strokeDasharray()),
      of('round').pipe(this.$.shadow.line.strokeLinecap()),
      of(.5).pipe(this.$.shadow.line.strokeOpacity()),
      of(5).pipe(this.$.shadow.line.strokeWidth()),
    ];
  }
}

const TEST = registerCustomElement({
  tag: 'ps-test',
  ctrl: TestElement,
  spec: $test,
  template: '<svg><line></line></svg>',
});

test('@persona/src/html/line', init => {
  const _ = init(() => {
    runEnvironment(new BrowserSnapshotsEnv('src/html/goldens', goldens));

    const tester = setupTest({roots: [TEST]});
    return {tester};
  });

  should('render the line correctly', () => {
    const element = _.tester.createElement(TEST);
    assert(element).to.matchSnapshot('line.html');
  });
});