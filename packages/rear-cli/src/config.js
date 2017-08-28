// @flow
import fs from 'fs-extra';
import path from 'path';
import {NODE_MODULES} from './constants';

const resolveApp = (...args: Array<string>) => {
  return path.resolve(
    fs.realpathSync(process.cwd()),
    path.join(...args)
  );
};

export const Config = {
  binDir: resolveApp(NODE_MODULES, '.bin'),
  cwd: process.cwd()
};

export default Config;
