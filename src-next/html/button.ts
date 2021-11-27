import {iflag} from '../input/flag';

import {HtmlRegistration} from './html-spec';


export const BUTTON: HtmlRegistration = {
  spec: {
    host: {
      autofocus: iflag('autofocus'),
      disabled: iflag('disabled'),
    },
  },
};