import collectionTypes from './collection-types';
import components from './components';
import contentTypes from './content-types';
import init from './init';
import relations from './relations';
import singleTypes from './single-types';
import uid from './uid';
import history from '../history';
import preview from '../preview';
import homepage from '../homepage';
import auditLogs from './audit-logs';

export default {
  'audit-logs': auditLogs,
  'collection-types': collectionTypes,
  components,
  'content-types': contentTypes,
  init,
  relations,
  'single-types': singleTypes,
  uid,
  ...(history.controllers ? history.controllers : {}),
  ...(preview.controllers ? preview.controllers : {}),
  ...homepage.controllers,
};
