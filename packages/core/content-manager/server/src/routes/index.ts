import admin from './admin';
import auditLogs from './audit-logs';
import history from '../history';
import preview from '../preview';
import homepage from '../homepage';

export default {
  admin,
  'audit-logs': auditLogs,
  ...(history.routes ? history.routes : {}),
  ...(preview.routes ? preview.routes : {}),
  ...homepage.routes,
};
