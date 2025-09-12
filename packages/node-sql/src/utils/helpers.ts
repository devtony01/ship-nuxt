import * as _ from 'lodash';

const deepCompare = (
  data: unknown,
  initialData: unknown,
  properties: Array<string | Record<string, unknown>>,
): boolean => properties.some((prop) => {
  let isChanged;

  if (typeof prop === 'string') {
    const value = _.get(data, prop);
    const initialValue = _.get(initialData, prop);

    isChanged = !_.isEqual(value, initialValue);
  } else {
    isChanged = Object.keys(prop).every((p) => {
      const value = _.get(data, p);
      const initialValue = _.get(initialData, p);

      return _.isEqual(value, prop[p]) && !_.isEqual(initialValue, prop[p]);
    });
  }

  return isChanged;
});

const generateId = (): string => {
  // Generate a unique string ID similar to MongoDB ObjectId
  const timestamp = Math.floor(Date.now() / 1000).toString(16);
  const randomBytes = Math.random().toString(16).substring(2, 18);
  return timestamp + randomBytes;
};

const addUpdatedAtField = <T extends Record<string, any>>(update: Partial<T>): Partial<T> => {
  return {
    ...update,
    updatedAt: new Date(),
  };
};

export { deepCompare, generateId, addUpdatedAtField };