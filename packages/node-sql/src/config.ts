import * as _ from 'lodash';

const env = process.env.NODE_ENV || 'test';

// Base configuration
let base = {
  env,
  mysql: {
    connection: process.env.MYSQL_URL || 'mysql://testuser:testpass@mysql:3306/testdb',
    master: process.env.MYSQL_MASTER_URL || 'mysql://testuser:testpass@mysql-master:3306/testdb',
    slave: process.env.MYSQL_SLAVE_URL || 'mysql://testuser:testpass@mysql-slave:3306/testdb',
  },
};

const load = () => {
  let resultConfig = base;
  let localConfig = { default: {} };
  
  try {
    localConfig = require('./config/local');
    resultConfig = _.merge(resultConfig, localConfig.default);
  } catch {
    // Local config is optional
  }
  
  return resultConfig;
};

base = load();

export { load };
export default base;
