set_vars({
  vars: {
    goldens: [
      'src/html/goldens',
      // 'src/output/goldens',
      // 'src/render/goldens',
    ],
  },
});

declare({
  name: 'link',
  as: shell({
    bin: 'npm',
    flags: [
      'link',
      'gs-tools',
      'gs-testing',
      'gs-types',
      'grapevine',
      'dev',
      'devbase',
      'moirai',
      'nabu',
    ],
  }),
});
