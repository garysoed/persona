import { CustomElementImpl } from './custom-element-impl';

export const __customElementImplFactory = Symbol('customElementImpl');

type CustomElementImplFactory =
    (element: HTMLElement, shadowMode: 'open'|'closed') => CustomElementImpl;

export type CustomElementClass = typeof HTMLElement &
    {[__customElementImplFactory]: CustomElementImplFactory};
