import {SpyObj} from 'gs-testing';

export function mixinDomListenable<T>(target: SpyObj<T>): T {
  const el = window.document.createElement('div');

  return Object.assign(
      target,
      {
        addEventListener: (
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean|AddEventListenerOptions,
        ) => {
          el.addEventListener(type, listener, options);
        },
        dispatchEvent: (e: Event) => el.dispatchEvent(e),
        removeEventListener: () => (
            type: string,
            listener: EventListenerOrEventListenerObject,
            options?: boolean|AddEventListenerOptions,
        ) => {
          el.removeEventListener(type, listener, options);
        },
      },
  );
}
