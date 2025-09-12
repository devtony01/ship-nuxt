import { and, gte, lt, or } from '@paracelsus/node-sql';
import { like, sql } from 'drizzle-orm';
import { users } from '@ship-nuxt/entities';
import { listUsersSchema } from '@ship-nuxt/schemas';
import { Router } from 'express';

import { userService } from 'resources/user';

import { validateMiddleware } from 'middlewares';

import { AppMiddleware, AppRequest, AppResponse, ListUsersParams } from 'types';

const handler: AppMiddleware = async (req: AppRequest, res: AppResponse) => {
  const { perPage, page, sort, searchValue, filter } = req.validatedData as ListUsersParams;

  const filterOptions = [];

  if (searchValue) {
    const searchFields = [users.firstName, users.lastName, users.email];
    const searchTerm = `%${searchValue.toLowerCase()}%`;

    filterOptions.push(
      or(...searchFields.map((field) => 
        like(sql`LOWER(${field})`, searchTerm)
      ))
    );
  }

  if (filter?.createdAt) {
    const { startDate, endDate } = filter.createdAt;

    const dateConditions = [
      ...(startDate ? [gte(users.createdAt, startDate)] : []),
      ...(endDate ? [lt(users.createdAt, endDate)] : []),
    ];

    if (dateConditions.length > 0) {
      filterOptions.push(and(...dateConditions));
    }
  }

  const result = await userService.find(
    filterOptions.length ? and(...filterOptions) : undefined,
    { page, perPage },
    { orderBy: sort || { createdAt: 'desc' } }
  );

  res.json({ ...result, results: result.results.map(userService.getPublic) });
};

export default (router: Router) => {
  router.get('/', validateMiddleware(listUsersSchema), handler);
};