import {source} from 'grapevine';
import {Observable, of} from 'rxjs';

export enum ParseType {
  HTML = 'application/xhtml+xml',
  SVG = 'image/svg+xml',
}

export type ElementForType<T extends ParseType> =
    T extends 'application/xhtml+xml' ? HTMLElement :
    T extends 'image/svg+xml' ? SVGElement :
    never;

export class HtmlParseService {
  private readonly elMap = new Map<string, Observable<Element|null>>();

  constructor(
      private readonly domParser: DOMParser = new DOMParser(),
  ) { }

  parse(raw: string, supportedType: ParseType): Observable<Element|null> {
    const existingEl$ = this.elMap.get(raw);
    if (existingEl$) {
      return existingEl$;
    }

    const xmlDoc = this.domParser.parseFromString(raw, supportedType);
    const el$ = of(xmlDoc.children.item(0));
    this.elMap.set(raw, el$);
    return el$;
  }
}

export const $htmlParseService = source(() => new HtmlParseService());

