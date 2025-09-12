import { routeUtil } from 'utils';

import listAction from './actions/list';
import removeAction from './actions/remove';
import updateAction from './actions/update';

const privateRoutes = [listAction, updateAction, removeAction];

export default {
  privateRoutes: routeUtil.getRoutes(privateRoutes),
};