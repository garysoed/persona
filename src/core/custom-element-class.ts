import {CustomElementDecorator} from './custom-element-decorator';

export const __customElementImplFactory = Symbol('customElementImpl');

type CustomElementImplFactory =
    (element: HTMLElement, shadowMode: 'open'|'closed') => CustomElementDecorator;

export type CustomElementClass = typeof HTMLElement &
    {[__customElementImplFactory]: CustomElementImplFactory};
