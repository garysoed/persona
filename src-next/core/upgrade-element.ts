import {BehaviorSubject} from 'rxjs';

import {ApiType, IOType, IVariable, OVariable} from '../types/io';
import {RegistrationSpec} from '../types/registration';
import {HostInnerSpec, InternalInnerSpec, Spec} from '../types/spec';

export function upgradeElement(
    registrationSpec: RegistrationSpec<Spec<HostInnerSpec, InternalInnerSpec>>,
    element: HTMLElement,
): void {
  createProperties(registrationSpec, element);
}

function createProperties(
    registrationSpec: RegistrationSpec<Spec<HostInnerSpec, InternalInnerSpec>>,
    element: HTMLElement,
): void {
  const descriptor: Record<string, PropertyDescriptor> = {};
  const valueMap$: Record<string, BehaviorSubject<unknown>> = {};
  const spec = {
    host: {},
    internal: {},
    ...(registrationSpec.spec ?? {}),
  };
  for (const key in spec.host) {
    const io = spec.host[key];
    if (io.apiType !== ApiType.VARIABLE) {
      continue;
    }

    const value$ = new BehaviorSubject<unknown>(io.defaultValue);
    descriptor[key] = createDescriptor(io, value$);
    valueMap$[key] = value$;
  }

  Object.defineProperties(
      element,
      {
        ...descriptor,
        $: {
          get: () => valueMap$,
        },
      });
}


function createDescriptor<T>(
    io: IVariable<T>|OVariable<T>,
    value$: BehaviorSubject<T>,
): PropertyDescriptor {
  const getterDescriptor: PropertyDescriptor = {
    get(): unknown {
      return value$.getValue();
    },
  };

  if (io.ioType === IOType.OUTPUT) {
    return getterDescriptor;
  }

  return {
    ...getterDescriptor,
    set(value: unknown): void {
      if (!io.valueType.check(value)) {
        throw new Error(`Invalid value ${value} expected ${io.valueType}`);
      }

      value$.next(value);
    },
  };
}