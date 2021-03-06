#!/usr/bin/env node

const { copyFileSync } = require('fs');
const { resolve, dirname } = require('path');

const [command, ...commandArgs] = process.argv.slice(2);

if (command === 'init') {
  const [destDir] = commandArgs;
  if (!destDir) {
    console.error(
      'The destination path is required to init msw-cypress.\n  $ msw-cypress init <path>'
    );
    process.exit(1);
  }

  const sourcePath = resolve(__dirname, '../templates/mockServiceWorker.js');
  const destPath = resolve(
    process.cwd(),
    destDir,
    'cypressMockServiceWorker.js'
  );

  try {
    copyFileSync(sourcePath, destPath);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(
        `Could not write in ${dirname(destPath)}. Check if the folder exists.`
      );

      process.exit(1);
    } else {
      console.log(err);
      process.exit(1);
    }
  }
}
