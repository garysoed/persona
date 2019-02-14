import { InstanceStreamId, instanceStreamId } from 'grapevine/export/component';
import { Type } from 'gs-types/export';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';
import { getChannel } from '../util/get-channel';

export class ChannelInput<T> implements Input<T> {
  readonly id: InstanceStreamId<T>;

  constructor(
      readonly channelName: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
      type: Type<T>,
  ) {
    this.id = instanceStreamId(`subject(${channelName})`, type);
  }

  getValue(root: ShadowRoot): Observable<T> {
    return this.resolver(root)
        .pipe(
            switchMap(el => getChannel(el, this.channelName)),
        );
  }
}

class UnresolvedChannelInput<T> implements
    UnresolvedElementProperty<Element, ChannelInput<T>> {
  constructor(
      private readonly channelName: string,
      private readonly type: Type<T>,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): ChannelInput<T> {
    return new ChannelInput(this.channelName, resolver, this.type);
  }
}

export function channelIn<T>(channelName: string, type: Type<T>): UnresolvedChannelInput<T> {
  return new UnresolvedChannelInput(channelName, type);
}

