import {Vine} from 'grapevine';

import {Spec} from '../types/ctrl';
import {CustomElementRegistration} from '../types/registration';


type GenericRegistration = CustomElementRegistration<HTMLElement, Spec>;

export interface InstallSpec {
  readonly customElementRegistry: CustomElementRegistry;
  readonly roots: readonly GenericRegistration[];
  readonly rootDoc: Document;
  readonly vine: Vine;
}

export function installCustomElements(spec: InstallSpec): ReadonlyMap<string, GenericRegistration> {
  const registrations = getAllRegistrations(spec.roots);
  for (const [tag, registration] of registrations) {
    registration.configure(spec.vine);
    spec.customElementRegistry.define(tag, registration.$ctor.get(spec.vine));
  }

  return registrations;
}

function getAllRegistrations(
    rootRegistrations: readonly GenericRegistration[],
): ReadonlyMap<string, GenericRegistration> {
  const registrations = new Map<string, GenericRegistration>();
  for (const registration of rootRegistrations) {
    registrations.set(registration.tag, registration);
    const subRegistrations = getAllRegistrations(registration.deps ?? []);
    for (const [tag, sub] of subRegistrations) {
      registrations.set(tag, sub);
    }
  }

  return registrations;
}
