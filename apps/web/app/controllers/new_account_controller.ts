import User from '#models/user';
import { signupValidator, type SignupData } from '#validators/user';
import type { HttpContext } from '@adonisjs/core/http';

export default class NewAccountController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/signup', {});
  }

  async store({ request, response, auth }: HttpContext) {
    const signupData: SignupData = await request.validateUsing(signupValidator);
    const { fullName, email, password, dateOfBirth } = signupData;
    const user = await User.create({
      fullName,
      email,
      password,
      dateOfBirth: dateOfBirth === '' ? null : (dateOfBirth ?? null),
    });

    await auth.use('web').login(user);
    response.redirect().toRoute('dashboard');
  }
}
