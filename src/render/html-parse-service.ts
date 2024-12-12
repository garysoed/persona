import {source} from 'grapevine';
import {Observable, of} from 'rxjs';

export enum ParseType {
  HTML = 'text/html',
  SVG = 'image/svg+xml',
}

export type ElementForType<T extends ParseType> = T extends ParseType.HTML
  ? HTMLElement
  : T extends ParseType.SVG
    ? SVGElement
    : never;

export class HtmlParseService {
  private readonly elMap = new Map<string, Observable<Element | null>>();

  constructor(private readonly domParser: DOMParser = new DOMParser()) {}

  parse(raw: string, supportedType: ParseType): Observable<Element | null> {
    const existingEl$ = this.elMap.get(raw);
    if (existingEl$) {
      return existingEl$;
    }

    const result = this.domParser.parseFromString(raw, supportedType);
    const el =
      supportedType === ParseType.HTML
        ? result.body.firstChild
        : result.firstChild;
    const el$ = of(el as Element | null);
    this.elMap.set(raw, el$);
    return el$;
  }
}

export const $htmlParseService = source(() => new HtmlParseService());
