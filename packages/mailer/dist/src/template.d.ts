export declare enum Template {
    RESET_PASSWORD = "RESET_PASSWORD",
    SIGN_UP_WELCOME = "SIGN_UP_WELCOME",
    VERIFY_EMAIL = "VERIFY_EMAIL"
}
export interface ResetPasswordProps {
    firstName: string;
    href: string;
}
export interface SignUpWelcomeProps {
    firstName: string;
    href: string;
}
export interface VerifyEmailProps {
    firstName: string;
    href: string;
}
export interface TemplateProps {
    [Template.RESET_PASSWORD]: ResetPasswordProps;
    [Template.SIGN_UP_WELCOME]: SignUpWelcomeProps;
    [Template.VERIFY_EMAIL]: VerifyEmailProps;
}
//# sourceMappingURL=template.d.ts.map