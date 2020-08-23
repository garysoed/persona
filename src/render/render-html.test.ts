import { assert, createSpyInstance, fake, should, test } from 'gs-testing';
import { of as observableOf } from 'rxjs';
import { map } from 'rxjs/operators';

import { renderHtml } from '../../export';
import { createFakeContext } from '../../export/testing';

import { $htmlParseService, HtmlParseService } from './html-parse-service';


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

  should(`emit the parse result`, () => {
    const el = document.createElement('div');
    fake(_.mockHtmlParseService.parse).always().return(observableOf(el));

    const tagName$ = renderHtml(RAW, SUPPORTED_TYPE, _.context)
        .pipe(map(el => (el as HTMLElement).tagName));

    assert(tagName$).to.emitWith('DIV');

    // Should emit the copy, not the exact instance.
    assert(renderHtml(RAW, SUPPORTED_TYPE, _.context)).toNot.emitWith(el);
  });
});
