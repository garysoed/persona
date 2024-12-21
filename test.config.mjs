import {reporter} from 'gs-testing/test-runner/index.mjs';

export default {
  files: ['out/bundle.js'],
  reporters: [reporter()],
};
