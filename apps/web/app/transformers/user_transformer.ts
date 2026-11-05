import type User from '#models/user';
import { BaseTransformer } from '@adonisjs/core/transformers';

export default class UserTransformer extends BaseTransformer<User> {
  toObject() {
    return this.pick(this.resource, [
      'id',
      'username',
      'fullName',
      'email',
      'phone',
      'avatarUrl',
      'about',
      'website',
      'socialLinks',
      'headline',
      'jobTitle',
      'company',
      'industry',
      'pronouns',
      'addressLine1',
      'addressLine2',
      'city',
      'region',
      'postalCode',
      'country',
      'locale',
      'timeZone',
      'dateOfBirth',
      'age',
      'emailVerifiedAt',
      'phoneVerifiedAt',
      'lastLoginAt',
      'isProfilePublic',
      'createdAt',
      'updatedAt',
      'initials',
    ]);
  }
}
