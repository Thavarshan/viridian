import { createHash, randomBytes } from 'node:crypto';
import type { HttpContext } from '@adonisjs/core/http';
import db from '@adonisjs/lucid/services/db';
import mail from '@adonisjs/mail/services/main';
import env from '#start/env';
import User from '#models/user';
import {
  forgotPasswordValidator,
  resetPasswordValidator,
  type ForgotPasswordData,
  type ResetPasswordData,
} from '#validators/user';
import { DateTime } from 'luxon';

type PasswordResetTokenRow = {
  id: number;
  user_id: number;
};

function isPasswordResetTokenRow(
  value: unknown,
): value is PasswordResetTokenRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    Number.isInteger(value.id) &&
    'user_id' in value &&
    Number.isInteger(value.user_id)
  );
}

function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export default class PasswordResetsController {
  async createForgotPassword({ inertia }: HttpContext) {
    return inertia.render('auth/forgot_password', {});
  }

  async storeForgotPassword({ request, response, session }: HttpContext) {
    const data: ForgotPasswordData = await request.validateUsing(
      forgotPasswordValidator,
    );
    const user = await User.findBy('email', data.email);

    if (user) {
      const token = randomBytes(32).toString('hex');
      const now = DateTime.now();
      const resetUrl = new URL('/password/reset', env.get('APP_URL'));
      resetUrl.searchParams.set('token', token);

      await db
        .table('password_reset_tokens')
        .insert({
          user_id: user.id,
          token_hash: hashResetToken(token),
          created_at: now.toJSDate(),
          expires_at: now.plus({ minutes: 60 }).toJSDate(),
        })
        .onConflict('user_id')
        .merge(['token_hash', 'created_at', 'expires_at']);

      await mail.send((message) => {
        message
          .to(user.email)
          .subject('Reset your Wire password')
          .html(
            `<p>We received a request to reset your Wire password.</p><p><a href="${resetUrl.href}">Choose a new password</a></p><p>This link expires in one hour. If you didn't request this, you can ignore this email.</p>`,
          )
          .text(
            `We received a request to reset your Wire password. Visit ${resetUrl.href} to choose a new password. This link expires in one hour. If you didn't request this, you can ignore this email.`,
          );
      });
    }

    session.flash(
      'success',
      'If that email belongs to an account, a password reset link is on its way.',
    );

    return response.redirect().back();
  }

  async createResetPassword({ request, inertia }: HttpContext) {
    const { token } = request.qs();

    return inertia.render('auth/reset_password', {
      token: typeof token === 'string' ? token : '',
    });
  }

  async storeResetPassword({ request, response, session }: HttpContext) {
    const data: ResetPasswordData = await request.validateUsing(
      resetPasswordValidator,
    );
    const tokenHash = hashResetToken(data.token);
    const now = DateTime.now().toJSDate();

    const passwordUpdated = await db.transaction(async (transaction) => {
      const resetToken: unknown = await transaction
        .from('password_reset_tokens')
        .select('id', 'user_id')
        .where('token_hash', tokenHash)
        .where('expires_at', '>', now)
        .forUpdate()
        .first();

      if (!isPasswordResetTokenRow(resetToken)) return false;

      const user = await User.query({ client: transaction })
        .where('id', resetToken.user_id)
        .first();
      if (!user) return false;

      user.password = data.password;
      await user.save();

      await transaction
        .from('password_reset_tokens')
        .where('id', resetToken.id)
        .delete();

      return true;
    });

    if (!passwordUpdated) {
      session.flash('error', 'This password reset link is invalid or expired.');
      return response.redirect().back();
    }

    session.flash('success', 'Your password has been reset. You can sign in.');
    return response.redirect().toRoute('session.create');
  }
}
