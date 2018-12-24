import { InstanceStreamId } from 'grapevine/export/component';
import { Observable } from 'gs-tools/node_modules/rxjs';

export interface Input<T> {
  readonly id: InstanceStreamId<T>;

  getValue(root: ShadowRoot): Observable<T>;
}
