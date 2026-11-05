import { type SchemaRules } from '@adonisjs/lucid/types/schema_generator';

export default {
  tables: {
    users: {
      columns: {
        social_links: {
          tsType: 'SocialLinks',
          imports: [
            {
              source: '#types/social_links',
              typeImports: ['SocialLinks'],
            },
          ],
        },
      },
    },
  },
} satisfies SchemaRules;
