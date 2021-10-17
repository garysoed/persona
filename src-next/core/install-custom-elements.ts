import {Vine} from 'grapevine';

import {Registration} from '../types/registration';

export interface InstallSpec {
  readonly customElementRegistry: CustomElementRegistry;
  readonly roots: readonly Registration[];
  readonly rootDoc: Document;
  readonly vine: Vine;
}

export function installCustomElements(spec: InstallSpec): readonly Registration[] {
  const registrations = getAllRegistrations(spec.roots);
  for (const registration of registrations) {
    registration.configure(spec.vine);
    spec.customElementRegistry.define(registration.tag, registration.get(spec.vine));
  }

  return registrations;
}

function getAllRegistrations(
    rootRegistrations: readonly Registration[],
): readonly Registration[] {
  const registrations = [];
  for (const registration of rootRegistrations) {
    registrations.push(
        registration,
        ...getAllRegistrations(registration.deps ?? []),
    );
  }

  return registrations;
}
