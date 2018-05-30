import { BaseDisposable, DisposableFunction } from 'gs-tools/export/dispose';
import { Event } from 'gs-tools/export/event';

export type Listener<E> = (
    root: ShadowRoot,
    context: BaseDisposable,
    useCapture: boolean) => DisposableFunction;
