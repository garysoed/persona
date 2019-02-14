import { InstanceStreamId, instanceStreamId } from 'grapevine/export/component';
import { InstanceofType, Type } from 'gs-types/export';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Input } from '../component/input';
import { UnresolvedElementProperty } from '../component/unresolved-element-property';
import { getChannel } from '../util/get-channel';

type SubjectFn<T> = (arg: T) => void;

export class ChannelOutput<T> implements Input<SubjectFn<T>> {
  readonly id: InstanceStreamId<SubjectFn<T>>;

  constructor(
      readonly channelName: string,
      readonly resolver: (root: ShadowRoot) => Observable<Element>,
  ) {
    this.id = instanceStreamId(`subject(${channelName})`, InstanceofType<SubjectFn<T>>(Function));
  }

  getValue(root: ShadowRoot): Observable<SubjectFn<T>> {
    return this.resolver(root)
        .pipe(
            map(el => (arg: T) => getChannel(el, this.channelName).next(arg)),
            shareReplay(1),
        );
  }
}

class UnresolvedChannelOutput<T> implements
    UnresolvedElementProperty<Element, ChannelOutput<T>> {
  constructor(
      private readonly channelName: string,
  ) { }

  resolve(resolver: (root: ShadowRoot) => Observable<Element>): ChannelOutput<T> {
    return new ChannelOutput(this.channelName, resolver);
  }
}

export function channelOut<T>(channelName: string): UnresolvedChannelOutput<T> {
  return new UnresolvedChannelOutput(channelName);
}

