// @flow
import {version} from '../package.json'

export function getHeader (stage?: string): string {
  const programName = stage ? `rear ${stage}` : 'rear';
  return `${programName}@v${version}`;
}

export default version;
