declare let base: {
    env: string;
    mysql: {
        connection: string;
        master: string;
        slave: string;
    };
};
declare const load: () => {
    env: string;
    mysql: {
        connection: string;
        master: string;
        slave: string;
    };
};
export { load };
export default base;
//# sourceMappingURL=config.d.ts.map