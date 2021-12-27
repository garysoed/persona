import {Observable, OperatorFunction} from 'rxjs';

import {Bindings, ResolvedBindingSpec, ResolvedI, ResolvedO, UnresolvedBindingSpec} from '../types/ctrl';
import {InputOutput, IOType} from '../types/io';

export function createBindings<S extends UnresolvedBindingSpec>(spec: ResolvedBindingSpec<S>): Bindings<S> {
  const bindings: Partial<Record<string, Observable<unknown>|(() => OperatorFunction<unknown, unknown>)>> = {};
  for (const key in spec) {
    const io = spec[key];
    bindings[key] = createBinding(io);
  }
  return bindings as Bindings<S>;
}

export function createBinding(io: InputOutput&(ResolvedI<unknown>|ResolvedO<any>)): Observable<unknown>|(() => OperatorFunction<unknown, unknown>) {
  switch (io.ioType) {
    // TODO(#8): Remove casts, only breaks outside VSCode
    case IOType.INPUT:
      return (io as ResolvedI<unknown>).value$;
    case IOType.OUTPUT:
      return () => (io as ResolvedO<unknown>).update();
  }
}