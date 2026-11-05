/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel';
import { controllers } from '#generated/controllers';
import db from '@adonisjs/lucid/services/db';
import router from '@adonisjs/core/services/router';

router.get('/health', async ({ response }) => {
  await db.rawQuery('select 1');

  return response.ok({ status: 'ok' });
});

router.on('/').renderInertia('home', {}).as('home');

router
  .group(() => {
    router.get('signup', [controllers.NewAccount, 'create']);
    router.post('signup', [controllers.NewAccount, 'store']);

    router.get('login', [controllers.Session, 'create']);
    router.post('login', [controllers.Session, 'store']);

    router
      .get('password/forgot', [
        controllers.PasswordResets,
        'createForgotPassword',
      ])
      .as('password.forgot.create');
    router
      .post('password/forgot', [
        controllers.PasswordResets,
        'storeForgotPassword',
      ])
      .as('password.forgot.store');
    router
      .get('password/reset', [
        controllers.PasswordResets,
        'createResetPassword',
      ])
      .as('password.reset.create');
    router
      .post('password/reset', [
        controllers.PasswordResets,
        'storeResetPassword',
      ])
      .as('password.reset.store');
  })
  .use(middleware.guest());

router
  .group(() => {
    router.on('/dashboard').renderInertia('dashboard', {}).as('dashboard');
    router.post('logout', [controllers.Session, 'destroy']);
    router
      .get('settings/profile', [controllers.Profile, 'edit'])
      .as('profile.edit');
    router
      .put('settings/profile', [controllers.Profile, 'update'])
      .as('profile.update');
  })
  .use(middleware.auth());
