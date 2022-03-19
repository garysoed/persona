import {source} from 'grapevine';

import {Spec} from '../types/ctrl';
import {CustomElementRegistration} from '../types/registration';


const $templateCache = source(() => new Map<string, HTMLTemplateElement>());
export const $getTemplate = source(vine => {
  return (spec: CustomElementRegistration<HTMLElement, Spec>) => {
    const templateCache = $templateCache.get(vine);
    const template = templateCache.get(spec.tag);
    if (template) {
      return template;
    }

    // TODO: Inject document
    const templateEl = document.createElement('template');
    templateEl.innerHTML = spec.template;
    templateCache.set(spec.tag, templateEl);

    return templateEl;
  };
});
