// @flow
import resolveApp from 'rear-core/resolve-app';
import {NODE_MODULES} from './constants';

export const Config = {
  binDir: resolveApp(NODE_MODULES, '.bin'),
  cwd: process.cwd()
};

export default Config;
