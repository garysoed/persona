set_vars({
  vars: {
    goldens: [
      'src-next/output/goldens',
      'src-next/render/goldens',
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
