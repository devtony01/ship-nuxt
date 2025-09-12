import { Template } from './template';
/**
 * Test utility for rendering email templates
 * This is used for testing and development purposes
 */
export declare function testEmailRendering(): Promise<{
    verifyEmail: string;
    signUpWelcome: string;
    resetPassword: string;
}>;
/**
 * Test specific template with custom params
 */
export declare function testSpecificTemplate<T extends Template>(template: T, params: any): Promise<string>;
//# sourceMappingURL=test-renderer.d.ts.map