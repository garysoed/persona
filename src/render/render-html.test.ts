import {assert, createSpyInstance, fake, should, test} from 'gs-testing';
import {of as observableOf} from 'rxjs';
import {map} from 'rxjs/operators';

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
        {type: RenderSpecType.HTML, raw: RAW, parseType: SUPPORTED_TYPE, id: 'id'},
        _.context,
    )
        .pipe(map(el => (el as unknown as HTMLElement).tagName));

    assert(tagName$).to.emitWith('DIV');

    // Should emit the copy, not the exact instance.
    assert(renderHtml(
        {type: RenderSpecType.HTML, raw: RAW, parseType: SUPPORTED_TYPE, id: 'id'},
        _.context,
    ))
        .toNot.emitWith(el as any);
  });
});
