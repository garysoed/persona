import {FakeEventTarget} from './fake-event-target';
import {FakeHistory} from './fake-history';
import {FakeLocation} from './fake-location';

export function createFakeWindow(): Window {
  const windowObj = new FakeEventTarget();
  const location = new FakeLocation();
  const history = new FakeHistory(windowObj, url => location.assign(url));

  return Object.assign(windowObj, {history, location}) as any;
}
