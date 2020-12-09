import {assert, createSpyInstance, fake, should, test} from 'gs-testing';
import {of as observableOf} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {createFakeContext} from '../testing/create-fake-context';

import {$htmlParseService, HtmlParseService} from './html-parse-service';
import {renderHtml} from './render-html';
import {RenderSpecType} from './types/render-spec-type';


test('@persona/render/render-html', init => {
  const RAW = 'RAW';
  const SUPPORTED_TYPE = 'text/xml';

  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const context = createFakeContext({shadowRoot});
    const mockHtmlParseService = createSpyInstance(HtmlParseService);
    $htmlParseService.set(context.vine, () => mockHtmlParseService);
    return {context, mockHtmlParseService};
  });

  should('emit the parse result', () => {
    const el = document.createElement('div');
    fake(_.mockHtmlParseService.parse).always().return(observableOf(el));

    const tagName$ = renderHtml(
        {
          type: RenderSpecType.HTML,
          raw: RAW,
          parseType: SUPPORTED_TYPE,
          id: 'id',
          decorator: el$ => el$.pipe(
              tap(el => {
                el.setAttribute('a', '1');
              }),
          ),
        },
        _.context,
    )
        .pipe(map(el => {
          const html = (el as unknown as HTMLElement);
          return html.tagName + html.getAttribute('a');
        }));

    assert(tagName$).to.emitWith('DIV1');

    // Should emit the copy, not the exact instance.
    assert(renderHtml(
        {type: RenderSpecType.HTML, raw: RAW, parseType: SUPPORTED_TYPE, id: 'id'},
        _.context,
    ))
        .toNot.emitWith(el as any);
  });
});
