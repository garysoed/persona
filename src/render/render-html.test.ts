import {assert, createSpy, createSpyInstance, fake, should, test} from 'gs-testing';
import {Observable, of as observableOf, of} from 'rxjs';
import {map} from 'rxjs/operators';

import {createFakeContext} from '../testing/create-fake-context';

import {$htmlParseService, HtmlParseService} from './html-parse-service';
import {NodeWithId} from './node-with-id';
import {renderHtml} from './render-html';
import {RenderSpecType} from './types/render-spec-type';


test('@persona/render/render-html', init => {
  const RAW = 'RAW';
  const SUPPORTED_TYPE = 'text/xml';

  const _ = init(() => {
    const el = document.createElement('div');
    const shadowRoot = el.attachShadow({mode: 'open'});
    const mockHtmlParseService = createSpyInstance(HtmlParseService);
    const context = createFakeContext({
      shadowRoot,
      overrides: [
        {override: $htmlParseService, withValue: mockHtmlParseService},
      ],
    });
    return {context, mockHtmlParseService};
  });

  should('emit the parse result', () => {
    const el = document.createElement('div');
    fake(_.mockHtmlParseService.parse).always().return(observableOf(el));

    const spy = createSpy<Observable<unknown>, [NodeWithId<Node>]>('decorator');
    fake(spy).always().return(of({}));

    const tagName$ = renderHtml(
        {
          type: RenderSpecType.HTML,
          raw: observableOf(RAW),
          parseType: SUPPORTED_TYPE,
          id: 'id',
          decorators: [spy],
        },
        _.context,
    )
        .pipe(map(el => {
          const html = (el as unknown as HTMLElement);
          return html.tagName;
        }));

    assert(tagName$).to.emitWith('DIV');
    assert(spy).to.haveBeenCalled();

    // Should emit the copy, not the exact instance.
    assert(renderHtml(
        {
          type: RenderSpecType.HTML,
          raw: observableOf(RAW),
          parseType: SUPPORTED_TYPE,
          id: 'id',
        },
        _.context,
    ))
        .toNot.emitWith(el as any);
  });
});
