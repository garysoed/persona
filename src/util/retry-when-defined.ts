import {BehaviorSubject, from, MonoTypeOperatorFunction} from 'rxjs';
import {retryWhen, switchMapTo} from 'rxjs/operators';

export function retryWhenDefined<T>(
  tagName: string,
): MonoTypeOperatorFunction<T> {
  return retryWhen(() => {
    return (
      from(window.customElements.whenDefined(tagName.toLowerCase()))
        // Use BehaviorSubject so it doesn't complete.
        .pipe(switchMapTo(new BehaviorSubject({})))
    );
  });
}
