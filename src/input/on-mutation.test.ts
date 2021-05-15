import {assert, createSpySubject, runEnvironment, should, test} from 'gs-testing';
import {filter, map} from 'rxjs/operators';

import {$input} from '../html/input';
import {element} from '../selector/element';
import {createFakeContext} from '../testing/create-fake-context';
import {PersonaTesterEnvironment} from '../testing/persona-tester-environment';

import {onMutation} from './on-mutation';


test('@persona/input/on-mutation', init => {
  const ELEMENT_ID = 'test';

  const _ = init(() => {
    runEnvironment(new PersonaTesterEnvironment());

    const $ = element(ELEMENT_ID, $input, {
      onMutation: onMutation({childList: true}),
    });

    const root = document.createElement('div');
    const shadowRoot = root.attachShadow({mode: 'open'});

    const el = document.createElement('input');
    el.id = ELEMENT_ID;
    shadowRoot.appendChild(el);

    return {input: $._.onMutation, context: createFakeContext({shadowRoot}), el};
  });

  should('emit the records correctly', () => {
    const addedEl = document.createElement('div');
    const records$ = createSpySubject(_.input.getValue(_.context)
        .pipe(
            filter(records => records.length > 0),
            map(records => records[0].addedNodes.item(0)),
        ),
    );

    assert(records$).toNot.emit();

    _.el.appendChild(addedEl);

    assert(records$).to.emitWith(addedEl);
  });
});
