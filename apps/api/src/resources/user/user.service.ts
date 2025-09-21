import { eq } from '@paracelsus/node-sql';
import { users } from '@ship-nuxt/entities';
import { insertUserSchema } from '@ship-nuxt/schemas';
import _ from 'lodash';

import database from 'db';

type User = typeof users.$inferSelect;

const service = database.createService<User>(users, {
  schemaValidator: (obj) => insertUserSchema.parseAsync(obj),
  useAutoIncrement: true,
});

const updateLastRequest = (id: number) =>
  service.atomic.updateOne(eq(users.id, id), {
    lastRequest: new Date(),
  });

const privateFields = ['passwordHash'];

const getPublic = (user: User | null) => _.omit(user, privateFields);

export default Object.assign(service, {
  updateLastRequest,
  getPublic,
});
