import {hasPropertiesType, instanceofType} from 'gs-types';

import {ShadowContext} from '../core/shadow-context';
import {PropertySpecs, Resolved} from '../selector/property-spec';

import {Selectable} from './selectable';


export interface Selector<S extends Selectable, P extends PropertySpecs<S>> {
  readonly _: Resolved<S, P>;
  getSelectable(context: ShadowContext): S;
}

export const SELECTOR_TYPE = hasPropertiesType<Selector<Selectable, PropertySpecs<Selectable>>>({
  _: instanceofType<Resolved<Selectable, PropertySpecs<Selectable>>>(Object),
  getSelectable: instanceofType(Function),
});
