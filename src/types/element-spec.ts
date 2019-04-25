import { Vine } from '@grapevine';
import { CustomElementCtrlCtor } from './custom-element-ctrl';

export interface BaseCustomElementSpec {
  dependencies?: CustomElementCtrlCtor[];
  shadowMode?: 'open'|'closed';
  configure?(vine: Vine): void;
}

/**
 * Specs that define a custom element.
 */
export interface CustomElementSpec extends BaseCustomElementSpec {
  tag: string;
  template: string;
}
