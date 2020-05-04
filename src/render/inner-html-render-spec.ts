import {filterByType} from 'gs-tools/export/rxjs';
import { NEVER, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { $innerHtmlParseService, ParseType } from './inner-html-parse-service';
import { RenderSpec } from './render-spec';
import { Vine } from 'grapevine';
import { instanceofType } from 'gs-types';

export class InnerHtmlRenderSpec implements RenderSpec {
  constructor(
      private readonly raw: string,
      private readonly supportedType: ParseType,
      private readonly vine: Vine,
  ) { }

  canReuseElement(): boolean {
    return false;
  }

  createElement(): Observable<Element> {
    return $innerHtmlParseService.get(this.vine).pipe(
        switchMap(service => service.parse(this.raw, this.supportedType)),
        filterByType(instanceofType(Element)),
    );
  }

  registerElement(): Observable<unknown> {
    return NEVER;
  }
}
