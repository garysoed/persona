import {hasPropertiesType, instanceofType} from 'gs-types';

import {PersonaContext} from '../core/persona-context';
import {PropertySpecs, Resolved} from '../selector/property-spec';

import {Selectable} from './selectable';


export interface Selector<S extends Selectable, P extends PropertySpecs<S>> {
  readonly _: Resolved<S, P>;
  getSelectable(context: PersonaContext): S;
}

export const SELECTOR_TYPE = hasPropertiesType<Selector<Selectable, PropertySpecs<Selectable>>>({
  _: instanceofType(Object),
  getSelectable: instanceofType(Function),
});
