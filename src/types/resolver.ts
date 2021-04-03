import {ShadowContext} from '../core/shadow-context';

import {Selectable} from './selectable';


export type Resolver<S extends Selectable> = (context: ShadowContext) => S;
