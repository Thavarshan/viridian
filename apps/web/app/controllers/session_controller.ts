import User from '#models/user';
import { loginValidator, type LoginData } from '#validators/user';
import type { HttpContext } from '@adonisjs/core/http';
import { DateTime } from 'luxon';

export default class SessionController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {});
  }

  async store({ request, auth, response }: HttpContext) {
    const loginData: LoginData = await request.validateUsing(loginValidator);
    const { email, password } = loginData;
    const user = await User.verifyCredentials(email, password);
    user.lastLoginAt = DateTime.now();
    await user.save();

    await auth.use('web').login(user);
    response.redirect().toRoute('dashboard');
  }

  async destroy({ auth, response }: HttpContext) {
    await auth.use('web').logout();
    response.redirect().toRoute('session.create');
  }
}
