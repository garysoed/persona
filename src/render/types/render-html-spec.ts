import {Observable, OperatorFunction} from 'rxjs';
import {tap} from 'rxjs/operators';

import {ParserSupportedType} from '../html-parse-service';

import {RenderSpecType} from './render-spec-type';


interface Input<T extends ParserSupportedType> {
  readonly raw: Observable<string>;
  readonly parseType: T;
  readonly decorator?: OperatorFunction<Element, unknown>;
}

export interface RenderHtmlSpec<T extends ParserSupportedType> extends Input<T> {
  readonly type: RenderSpecType.HTML;
  readonly raw: Observable<string>
  readonly decorator: OperatorFunction<Element, unknown>;
}

export function renderHtml<T extends ParserSupportedType>(input: Input<T>): RenderHtmlSpec<T> {
  return {
    type: RenderSpecType.HTML,
    decorator: tap(),
    ...input,
  };
}
