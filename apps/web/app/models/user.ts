import { UserSchema } from '#database/schema';
import hash from '@adonisjs/core/services/hash';
import { compose } from '@adonisjs/core/helpers';
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid';
import { DateTime } from 'luxon';

export default class User extends compose(UserSchema, withAuthFinder(hash)) {
  get age(): number | null {
    if (!this.dateOfBirth) return null;

    const today = DateTime.now();
    const birthDate = this.dateOfBirth;
    if (birthDate.toMillis() > today.toMillis()) return null;

    const birthdayHasPassed =
      today.month > birthDate.month ||
      (today.month === birthDate.month && today.day >= birthDate.day);

    return today.year - birthDate.year - Number(!birthdayHasPassed);
  }

  get initials(): string {
    const nameParts = this.fullName?.trim().split(/\s+/).filter(Boolean);

    if (nameParts?.length) {
      const firstName = nameParts[0];
      const lastName = nameParts.at(-1);

      if (nameParts.length > 1 && firstName && lastName) {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
      }

      return (firstName ?? '').slice(0, 2).toUpperCase();
    }

    const emailPrefix = this.email.split('@')[0] ?? '';
    return emailPrefix.slice(0, 2).toUpperCase();
  }
}
