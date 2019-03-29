import { InstanceStreamId } from '@grapevine/component';
import { Observable } from 'rxjs';

export interface Input<T> {
  readonly id: InstanceStreamId<T>;

  getValue(root: ShadowRoot): Observable<T>;
}
