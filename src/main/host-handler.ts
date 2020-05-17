import { of as observableOf } from 'rxjs';

import { HandlerInput } from '../input/handler';
import { Input } from '../types/input';

export class HostHandler extends HandlerInput implements Input<readonly unknown[]> {
  constructor(
      readonly functionName: string,
  ) {
    super(functionName, ({shadowRoot}) => observableOf(shadowRoot.host));
  }
}
