import {iflag} from '../input/flag';


export const BUTTON = {
  spec: {
    host: {
      autofocus: iflag('autofocus'),
      disabled: iflag('disabled'),
    },
  },
  tag: 'button',
};