import { Vine } from '@grapevine';
import { Observable } from 'rxjs';
import { CustomElementCtrl } from './custom-element-ctrl';

export type CustomElementCtrlCtor = new (...args: any[]) => CustomElementCtrl;

export interface BaseCustomElementSpec {
  dependencies?: CustomElementCtrlCtor[];
  shadowMode?: 'open'|'closed';
  configure?(vine: Vine): void;
}

export type InitFn = (vine: Vine, root: ShadowRoot) => Observable<unknown>;

/**
 * Specs that define a custom element.
 */
export interface CustomElementSpec extends BaseCustomElementSpec {
  tag: string;
  template: string;
}
