import type {components, operations} from './generated/openapi';

/**
 * Compile-time shapes from the published OpenAPI spec.
 * Runtime validation of the fields we use still lives in Zod parsers.
 * @see https://openapi-ts.dev/introduction
 */
export type OpenApiContentEnvelope = components['schemas']['ContentEnvelope'];
export type OpenApiDeliveryContext = components['schemas']['DeliveryContext'];
export type OpenApiPublicPage = components['schemas']['PublicPage'];
export type OpenApiPublicAlert = components['schemas']['PublicAlert'];
export type OpenApiPublicNavigation = components['schemas']['PublicNavigation'];
export type OpenApiPublicPromotion = components['schemas']['PublicPromotion'];
export type OpenApiFormSubmissionRequest =
  components['schemas']['MobileFormSubmissionRequest'];
export type OpenApiFormSubmissionResponse =
  components['schemas']['MobileFormSubmissionResponse'];
export type OpenApiPageSlug = components['parameters']['mobilePageSlug'];
export type OpenApiContentQuery =
  operations['getApiContentV1PagesSlug']['parameters']['query'];
export type OpenApiPageEnvelope = OpenApiContentEnvelope & {
  data: OpenApiPublicPage;
};
