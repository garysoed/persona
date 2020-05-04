import { Vine } from 'grapevine';
import { assert, createSpyInstance, fake, run, should, test } from 'gs-testing';
import { of as observableOf } from 'rxjs';

import { $innerHtmlParseService, InnerHtmlParseService } from './inner-html-parse-service';
import { InnerHtmlRenderSpec } from './inner-html-render-spec';

test('@persona/render/inner-html-render-spec', init => {
  const RAW = 'RAW';
  const SUPPORTED_TYPE = 'text/xml';

  const _ = init(() => {
    const vine = new Vine('test');
    const mockInnerHtmlParseService = createSpyInstance(InnerHtmlParseService);
    $innerHtmlParseService.set(vine, () => mockInnerHtmlParseService);
    const spec = new InnerHtmlRenderSpec(RAW, SUPPORTED_TYPE, vine);
    return {mockInnerHtmlParseService, vine, spec};
  });

  test('createElement', () => {
    should(`emit the parse result if an Element`, () => {
      const el = document.createElement('div');
      fake(_.mockInnerHtmlParseService.parse).always().return(observableOf(el));

      assert(_.spec.createElement()).to.emitWith(el);
    });

    should(`not emit the parse result if not an element`, () => {
      fake(_.mockInnerHtmlParseService.parse).always().return(observableOf(null));

      assert(_.spec.createElement()).toNot.emit();
    });
  });
});
