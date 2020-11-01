import { assert, createSpyInstance, fake, should, test } from 'gs-testing';
import { map } from 'rxjs/operators';
import { of as observableOf } from 'rxjs';

import { createFakeContext } from '../testing/create-fake-context';

import { $htmlParseService, HtmlParseService } from './html-parse-service';
import { renderHtml } from './render-html';


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

    const tagName$ = renderHtml(RAW, SUPPORTED_TYPE, 'id', _.context)
        .pipe(map(el => (el as unknown as HTMLElement).tagName));

    assert(tagName$).to.emitWith('DIV');

    // Should emit the copy, not the exact instance.
    assert(renderHtml(RAW, SUPPORTED_TYPE, 'id', _.context)).toNot.emitWith(el as any);
  });
});
