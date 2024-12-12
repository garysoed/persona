load('node_modules/devbase/.mk.config-base.js');
load('node_modules/devbase/ts/.mk.config-base.js');

set_vars({
  vars: {
    local_deps: [
      'gs-tools',
      'gs-testing',
      'gs-types',
      'grapevine',
      'devbase',
      'moirai',
      'nabu',
    ],
  },
});

set_vars({
  vars: {
    goldens: ['src/html/goldens', 'src/output/goldens', 'src/render/goldens'],
  },
});
