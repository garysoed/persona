import {Spec} from '../types/ctrl';
import {ApiType} from '../types/io';
import {RegistrationSpec} from '../types/registration';

export function getObservedAttributes<S extends Spec>(
    registrationSpec: RegistrationSpec<S>,
): readonly string[] {
  const attributes = [];
  const hostSpecs = registrationSpec.spec.host ?? {};
  for (const key in hostSpecs) {
    const spec = hostSpecs[key];
    if (spec.apiType !== ApiType.ATTR && spec.apiType !== ApiType.FLAG) {
      continue;
    }

    attributes.push(spec.attrName);
  }

  return attributes;
}