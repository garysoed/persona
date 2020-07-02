import { Vine } from 'grapevine';
import { filterByType } from 'gs-tools/export/rxjs';
import { instanceofType } from 'gs-types';
import { NEVER, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { $innerHtmlParseService, ParseType } from './inner-html-parse-service';
import { RenderSpec } from './render-spec';


export class InnerHtmlRenderSpec implements RenderSpec {
  constructor(
      private readonly raw: string,
      private readonly supportedType: ParseType,
      private readonly vine: Vine,
  ) { }

  canReuseNode(): boolean {
    return false;
  }

  createNode(): Observable<Element> {
    return $innerHtmlParseService.get(this.vine).pipe(
        switchMap(service => service.parse(this.raw, this.supportedType)),
        filterByType(instanceofType(Element)),
        map(el => el.cloneNode(true) as Element),
    );
  }

  registerNode(): Observable<unknown> {
    return NEVER;
  }
}
