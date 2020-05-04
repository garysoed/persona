import { source } from 'grapevine';
import { Observable, of as observableOf } from 'rxjs';

export type ParseType = 'image/svg+xml'|'text/xml';

export class InnerHtmlParseService {
  private readonly elMap = new Map<string, Observable<Element|null>>();

  constructor(
      private readonly domParser: DOMParser = new DOMParser(),
  ) { }

  parse(raw: string, supportedType: ParseType): Observable<Element|null> {
    const existingEl$ = this.elMap.get(raw);
    if (existingEl$) {
      return existingEl$;
    }

    // TODO: Do this in web worker?
    const xmlDoc = this.domParser.parseFromString(raw, supportedType);
    const el$ = observableOf(xmlDoc.children.item(0));
    this.elMap.set(raw, el$);
    return el$;
  }
}

export const $innerHtmlParseService = source(() => new InnerHtmlParseService());

