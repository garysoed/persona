import { Subject } from 'rxjs';

export function getChannel<T>(el: any, channelName: string): Subject<T> {
  const subject = el[channelName] || new Subject();
  if (!(subject instanceof Subject)) {
    throw new Error(`Property ${channelName} is not a Subject`);
  }
  el[channelName] = subject;

  return subject;
}
