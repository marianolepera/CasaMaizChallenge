/**
 * Generated from the published Casa Maiz OpenAPI spec.
 * Do not edit. Regenerate with `npm run cms:types`.
 * Source: https://payload-cms-poc-seven.vercel.app/api/openapi.json
 * @see https://openapi-ts.dev/introduction
 */
export interface paths {
    "/api/content/v1/bootstrap": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Bootstrap a client experience
         * @description Returns the main navigation, home promotions, experience config, feature flags, operational controls, and active alerts in one cacheable request.
         */
        get: operations["getApiContentV1Bootstrap"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/content/v1/pages/{slug}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get a delivered page by slug
         * @description Returns a published, audience-matched page. Blocks that do not support the requested platform, audience, or visibility window are removed. A valid previewSecret enables draft delivery.
         */
        get: operations["getApiContentV1PagesSlug"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/content/v1/legal/{key}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get legal content by key
         * @description Returns published legal content matching the delivery audience.
         */
        get: operations["getApiContentV1LegalKey"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/form-submissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Submit a CMS form
         * @description Creates a public Payload form submission from a formBlock rendered by mobile-restaurant.
         */
        post: operations["submitMobileForm"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/api/media/file/{filename}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Download an uploaded media file
         * @description Streams a file from the media upload collection. Content-Type depends on the stored file.
         */
        get: operations["getApiMediaFileFilename"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        /** @description Payload error response. Some custom endpoints use the shorter error property. */
        APIError: {
            error?: string;
            errors?: {
                message?: string;
                name?: string;
                path?: string;
            }[];
        };
        MobileFormSubmissionResponse: {
            message?: string;
            doc?: {
                id?: string;
            } & {
                [key: string]: unknown;
            };
        };
        /**
         * @example {
         *       "form": "contact-form-id",
         *       "submissionData": [
         *         {
         *           "field": "name",
         *           "value": "Ana"
         *         },
         *         {
         *           "field": "newsletter",
         *           "value": true
         *         }
         *       ]
         *     }
         */
        MobileFormSubmissionRequest: {
            /** @description Payload form document ID received inside a formBlock. */
            form: string;
            submissionData: {
                /** @description Form field name. */
                field: string;
                /** @description Checkboxes use booleans; other mobile fields use strings. */
                value: string | boolean;
            }[];
        };
        ContentEnvelope: {
            /** @constant */
            contractVersion: "1.1";
            data?: unknown;
            /** Format: date-time */
            nextChangeAt?: string;
            preview?: boolean;
            resolvedContext?: components["schemas"]["DeliveryContext"];
        };
        /**
         * @example {
         *       "appVersion": "2.4.0",
         *       "authenticationState": "guest",
         *       "market": "MX",
         *       "now": "2026-07-23T12:00:00.000Z",
         *       "platform": "web",
         *       "store": "centro"
         *     }
         */
        DeliveryContext: {
            appVersion?: string;
            /** @enum {string} */
            authenticationState: "authenticated" | "guest";
            market?: string;
            /** Format: date-time */
            now: string;
            /** @enum {string} */
            platform: "web" | "ios" | "android";
            store?: string;
        };
        PublicPage: {
            id: string;
            indexable: boolean;
            /** @description Audience-filtered block union. Every block includes blockType and contractVersion. */
            layout: ({
                /** @enum {string} */
                blockType: "restaurantHero" | "carousel" | "cardGrid" | "restaurantCTA" | "promoRail" | "textBlock" | "imageBlock" | "cta" | "content" | "mediaBlock" | "archive" | "formBlock";
                /** @constant */
                contractVersion: "1.1";
            } & {
                [key: string]: unknown;
            })[];
            meta?: {
                [key: string]: unknown;
            } | null;
            slug: string;
            title: string;
            /** Format: date-time */
            updatedAt: string;
        };
        PublicPromotion: {
            id?: string;
            title?: string;
            eyebrow?: string;
            description?: string;
            placement?: string;
            priority?: number;
            desktopImage?: unknown;
            mobileImage?: unknown;
            cta?: {
                [key: string]: unknown;
            } | null;
            externalPromotion?: boolean;
        };
        PublicNavigation: {
            id?: string;
            key?: string;
            name?: string;
            items?: {
                destination?: components["schemas"]["Destination"];
                highlighted?: boolean;
                icon?: string;
                label?: string;
            }[];
        } | null;
        Destination: {
            key?: string;
            label?: string;
            path?: string;
            supportedPlatforms?: ("web" | "ios" | "android")[];
        } | null;
        PublicAlert: {
            actions: {
                href: string;
                label: string;
            }[];
            dismissible: boolean;
            eyebrow?: string;
            frequency?: {
                [key: string]: unknown;
            };
            id: string;
            image?: unknown;
            message?: string;
            pageSlugs?: string[];
            placement: string;
            priority: number;
            /** Format: date-time */
            revision: string;
            title: string;
            trigger?: {
                [key: string]: unknown;
            };
        };
    };
    responses: {
        /** @description Unexpected server error. */
        ServerError: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["APIError"];
            };
        };
        /** @description The requested resource was not found. */
        NotFound: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["APIError"];
            };
        };
        /** @description The authenticated principal lacks permission. */
        Forbidden: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["APIError"];
            };
        };
        /** @description Authentication is required. */
        Unauthorized: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["APIError"];
            };
        };
        /** @description Invalid path, query parameters, or request body. */
        BadRequest: {
            headers: {
                [name: string]: unknown;
            };
            content: {
                "application/json": components["schemas"]["APIError"];
            };
        };
    };
    parameters: {
        /**
         * @description Installed application version returned by react-native-device-info.
         * @example 1.0.0
         */
        mobileAppVersion: string;
        /**
         * @description The current mobile application only requests guest content.
         * @example guest
         */
        mobileAudience: "guest";
        /**
         * @description Market configured by mobile-restaurant.
         * @example MX
         */
        mobileMarket: "MX";
        /**
         * @description React Native operating system selected from Platform.OS.
         * @example ios
         */
        mobilePlatform: "ios" | "android";
        /** @description Stable content key. */
        key: string;
        /** @description CMS page currently registered in the React Native navigator. */
        mobilePageSlug: "home" | "menu";
    };
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    getApiContentV1Bootstrap: {
        parameters: {
            query: {
                /**
                 * @description React Native operating system selected from Platform.OS.
                 * @example ios
                 */
                platform: components["parameters"]["mobilePlatform"];
                /**
                 * @description Market configured by mobile-restaurant.
                 * @example MX
                 */
                market: components["parameters"]["mobileMarket"];
                /**
                 * @description The current mobile application only requests guest content.
                 * @example guest
                 */
                audience: components["parameters"]["mobileAudience"];
                /**
                 * @description Installed application version returned by react-native-device-info.
                 * @example 1.0.0
                 */
                appVersion: components["parameters"]["mobileAppVersion"];
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContentEnvelope"] & {
                        data: {
                            alerts: components["schemas"]["PublicAlert"][];
                            experience: {
                                [key: string]: unknown;
                            } | null;
                            featureFlags: {
                                [key: string]: boolean;
                            };
                            navigation: components["schemas"]["PublicNavigation"];
                            operationalControls: {
                                [key: string]: unknown;
                            } | null;
                            promotions: components["schemas"]["PublicPromotion"][];
                        };
                    };
                };
            };
            400: components["responses"]["BadRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            404: components["responses"]["NotFound"];
            500: components["responses"]["ServerError"];
        };
    };
    getApiContentV1PagesSlug: {
        parameters: {
            query: {
                /**
                 * @description React Native operating system selected from Platform.OS.
                 * @example ios
                 */
                platform: components["parameters"]["mobilePlatform"];
                /**
                 * @description Market configured by mobile-restaurant.
                 * @example MX
                 */
                market: components["parameters"]["mobileMarket"];
                /**
                 * @description The current mobile application only requests guest content.
                 * @example guest
                 */
                audience: components["parameters"]["mobileAudience"];
                /**
                 * @description Installed application version returned by react-native-device-info.
                 * @example 1.0.0
                 */
                appVersion: components["parameters"]["mobileAppVersion"];
            };
            header?: never;
            path: {
                /** @description CMS page currently registered in the React Native navigator. */
                slug: components["parameters"]["mobilePageSlug"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContentEnvelope"] & {
                        data: components["schemas"]["PublicPage"];
                    };
                };
            };
            400: components["responses"]["BadRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            404: components["responses"]["NotFound"];
            500: components["responses"]["ServerError"];
        };
    };
    getApiContentV1LegalKey: {
        parameters: {
            query: {
                /**
                 * @description React Native operating system selected from Platform.OS.
                 * @example ios
                 */
                platform: components["parameters"]["mobilePlatform"];
                /**
                 * @description Market configured by mobile-restaurant.
                 * @example MX
                 */
                market: components["parameters"]["mobileMarket"];
                /**
                 * @description The current mobile application only requests guest content.
                 * @example guest
                 */
                audience: components["parameters"]["mobileAudience"];
                /**
                 * @description Installed application version returned by react-native-device-info.
                 * @example 1.0.0
                 */
                appVersion: components["parameters"]["mobileAppVersion"];
            };
            header?: never;
            path: {
                /** @description Stable content key. */
                key: components["parameters"]["key"];
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Successful response. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ContentEnvelope"] & {
                        data: {
                            [key: string]: unknown;
                        };
                    };
                };
            };
            400: components["responses"]["BadRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            404: components["responses"]["NotFound"];
            500: components["responses"]["ServerError"];
        };
    };
    submitMobileForm: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["MobileFormSubmissionRequest"];
            };
        };
        responses: {
            /** @description Form submission created. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["MobileFormSubmissionResponse"];
                };
            };
            400: components["responses"]["BadRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            500: components["responses"]["ServerError"];
        };
    };
    getApiMediaFileFilename: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                filename: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Binary media content. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/octet-stream": string;
                };
            };
            400: components["responses"]["BadRequest"];
            401: components["responses"]["Unauthorized"];
            403: components["responses"]["Forbidden"];
            404: components["responses"]["NotFound"];
            500: components["responses"]["ServerError"];
        };
    };
}
