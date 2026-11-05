export type SocialPlatform =
  | 'bluesky'
  | 'facebook'
  | 'github'
  | 'instagram'
  | 'linkedin'
  | 'mastodon'
  | 'threads'
  | 'tiktok'
  | 'x'
  | 'youtube';

export type SocialLinks = Partial<Record<SocialPlatform, string>>;
