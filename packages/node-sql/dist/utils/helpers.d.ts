declare const deepCompare: (data: unknown, initialData: unknown, properties: Array<string | Record<string, unknown>>) => boolean;
declare const generateId: () => string;
declare const addUpdatedAtField: <T extends Record<string, any>>(update: Partial<T>) => Partial<T>;
export { deepCompare, generateId, addUpdatedAtField };
//# sourceMappingURL=helpers.d.ts.map