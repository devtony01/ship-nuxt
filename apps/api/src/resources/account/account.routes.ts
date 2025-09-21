import { routeUtil } from 'utils';

import forgotPasswordAction from './actions/forgot-password';
import getAction from './actions/get';
import googleAction from './actions/google';
import resendEmailAction from './actions/resend-email';
import resetPasswordAction from './actions/reset-password';
import signInAction from './actions/sign-in';
import signOutAction from './actions/sign-out';
import signUpAction from './actions/sign-up';
import updateAction from './actions/update';
import verifyEmailAction from './actions/verify-email';
import verifyResetTokenAction from './actions/verify-reset-token';

const publicRoutes = [
  signUpAction,
  signInAction,
  signOutAction,
  forgotPasswordAction,
  resetPasswordAction,
  verifyResetTokenAction,
  verifyEmailAction,
  resendEmailAction,
  googleAction,
];

const privateRoutes = [getAction, updateAction];

export default {
  publicRoutes: routeUtil.getRoutes(publicRoutes),
  privateRoutes: routeUtil.getRoutes(privateRoutes),
};
