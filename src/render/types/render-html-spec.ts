import {OperatorFunction} from 'rxjs';

import {ParseType} from '../html-parse-service';
import {NodeWithId} from '../node-with-id';

import {BaseRenderSpec} from './base-render-spec';
import {ObservableOrValue} from './observable-or-value';
import {RenderSpecType} from './render-spec-type';


export interface RenderHtmlSpec extends BaseRenderSpec {
  readonly type: RenderSpecType.HTML;
  readonly raw: ObservableOrValue<string>;
  readonly parseType: ParseType;
  readonly decorator?: OperatorFunction<NodeWithId<Element>, NodeWithId<Element>>;
}
