import type { HttpContext } from '@adonisjs/core/http';
import User from '#models/user';
import { userProfileValidator, type UserProfileData } from '#validators/user';

export default class ProfileController {
  async edit({ inertia }: HttpContext) {
    return inertia.render('settings/profile', {});
  }

  async update({ auth, request, response, session }: HttpContext) {
    const profileData: UserProfileData =
      await request.validateUsing(userProfileValidator);
    const user = auth.getUserOrFail();
    const username = profileData.username?.trim();

    if (username) {
      const existingUser = await User.query()
        .where('username', username)
        .whereNot('id', user.id)
        .first();

      if (existingUser) {
        session.flash('error', 'That username is already taken.');
        return response.redirect().back();
      }
    }

    user.merge({
      ...profileData,
      username: username || null,
      dateOfBirth:
        profileData.dateOfBirth === ''
          ? null
          : (profileData.dateOfBirth ?? null),
      isProfilePublic: profileData.isProfilePublic ?? false,
    });
    await user.save();

    session.flash('success', 'Your profile has been updated.');
    return response.redirect().back();
  }
}
