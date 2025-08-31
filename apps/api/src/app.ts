/* eslint-disable simple-import-sort/imports, import/first */
// Allows requiring modules relative to /src folder,
// All options can be found here: https://gist.github.com/branneman/8048520
import moduleAlias from 'module-alias';

moduleAlias.addPath(__dirname);
moduleAlias(); // read aliases from package json

import express from 'express';
import routes from 'routes';

const app = express();
const port = 3000;

app.use(express.json());

routes(app);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on http://localhost:${port}`);
});
