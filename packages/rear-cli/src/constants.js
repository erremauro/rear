export const NODE_MODULES = process.env.NODE_PATH || 'node_modules';
export const NODE_MIN_VERSION = '7.0.0';
export const NPM_MIN_VERSION  = '3.0.0';
export const NOOP = () => {};
export const VALID_FILES = [
 '.DS_Store',
 'Thumbs.db',
 '.git',
 '.gitignore',
 '.idea',
 'README.md',
 'LICENSE',
 'web.iml',
 '.hg',
 '.hgignore',
 '.hgcheck',
];
export const KNOWN_GENERATED_FILES = [
  'package.json',
  'npm-debug.log',
  'yarn-error.log',
  'yarn-debug.log',
  'node_modules',
];
