// @flow
export const SystemTypes = {
  app: 'app',
  client: 'client',
  server: 'server',
  package: 'package'
};
export type SystemType = $Keys<typeof SystemTypes>;
export default SystemTypes;
