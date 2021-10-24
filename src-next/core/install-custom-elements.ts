import {Vine} from 'grapevine';

import {Spec} from '../types/ctrl';
import {Registration} from '../types/registration';

type GenericRegistration = Registration<HTMLElement, Spec>;

export interface InstallSpec {
  readonly customElementRegistry: CustomElementRegistry;
  readonly roots: readonly GenericRegistration[];
  readonly rootDoc: Document;
  readonly vine: Vine;
}

export function installCustomElements(spec: InstallSpec): readonly GenericRegistration[] {
  const registrations = getAllRegistrations(spec.roots);
  for (const registration of registrations) {
    registration.configure(spec.vine);
    spec.customElementRegistry.define(registration.tag, registration.get(spec.vine));
  }

  return registrations;
}

function getAllRegistrations(
    rootRegistrations: readonly GenericRegistration[],
): readonly GenericRegistration[] {
  const registrations = [];
  for (const registration of rootRegistrations) {
    registrations.push(
        registration,
        ...getAllRegistrations(registration.deps ?? []),
    );
  }

  return registrations;
}
