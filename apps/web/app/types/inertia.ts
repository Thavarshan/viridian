import { type Data } from '@generated/data';

/**
 * Shared server props combined with the page-specific serializable props.
 * React children are component input, so they do not belong in page data.
 */
export type InertiaProps<LocalProps extends object = Record<never, never>> =
  Data.SharedProps & LocalProps;

/**
 * Bridge the shared props and flash data inferred from the Inertia
 * middleware into the Inertia client, so `usePage().props`, `usePage().flash`,
 * and layout callbacks are typed globally without passing a generic at each
 * call site.
 */
declare module '@inertiajs/core' {
  interface InertiaConfig {
    sharedPageProps: Data.SharedProps;
    flashDataType: Data.FlashMessages;
  }
}
