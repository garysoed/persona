import {PersonaContext} from '../core/persona-context';

import {Input} from './input';
import {Output} from './output';
import {Selectable} from './selectable';

export interface Selector<S extends Selectable> {
  readonly _: {readonly [key: string]: Input<unknown>|Output<any>};
  getSelectable(context: PersonaContext): S;
}
