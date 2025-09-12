import { Template, TemplateProps } from './template';
export declare const renderEmailHtml: <T extends Template>({ template, params }: {
    template: T;
    params: TemplateProps[T];
}) => Promise<string>;
//# sourceMappingURL=utils-ssr.d.ts.map