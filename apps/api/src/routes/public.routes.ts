import { Router } from 'express';

import { accountRoutes } from 'resources/account';

import attachCustomErrorsMiddleware from './middlewares/attach-custom-errors.middleware';
import attachCustomPropertiesMiddleware from './middlewares/attach-custom-properties.middleware';
import extractTokensMiddleware from './middlewares/extract-tokens.middleware';
import routeErrorHandlerMiddleware from './middlewares/route-error-handler.middleware';
import tryToAttachUserMiddleware from './middlewares/try-to-attach-user.middleware';

const router: Router = Router();

router.use(attachCustomErrorsMiddleware);
router.use(attachCustomPropertiesMiddleware);
router.use(extractTokensMiddleware);
router.use(tryToAttachUserMiddleware);

router.use('/account', accountRoutes.publicRoutes);

router.use(routeErrorHandlerMiddleware);

export default router;
