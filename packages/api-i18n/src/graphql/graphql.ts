import { GraphQLSchemaPlugin } from "@webiny/handler-graphql/types";
import { SecurityContext } from "@webiny/api-security/types";
import { I18NQueryResolver } from "./resolvers/I18NQuery";
import { I18NMutationResolver } from "./resolvers/I18NMutation";
import { I18NContext } from "../types";

const plugin: GraphQLSchemaPlugin<I18NContext & SecurityContext> = {
    type: "graphql-schema",
    name: "graphql-schema-i18n",
    schema: {
        typeDefs: /* GraphQL */ `
            extend type Query {
                i18n: I18NQuery
            }

            extend type Mutation {
                i18n: I18NMutation
            }

            type I18NBooleanResponse {
                data: Boolean
                error: I18NError
            }

            type I18NDeleteResponse {
                data: Boolean
                error: I18NError
            }

            type I18NCursors {
                next: String
                previous: String
            }

            type I18NListMeta {
                cursors: I18NCursors
                hasNextPage: Boolean
                hasPreviousPage: Boolean
                totalCount: Int
            }

            type I18NError {
                code: String
                message: String
                data: JSON
            }

            input I18NInstallInput {
                code: String!
            }

            type I18NCreatedBy {
                id: ID
                displayName: String
            }

            type I18NLocale {
                code: String
                default: Boolean
                createdOn: DateTime
                createdBy: I18NCreatedBy
            }

            input I18NLocaleInput {
                code: String
                default: Boolean
                createdOn: DateTime
            }

            type I18NLocaleResponse {
                data: I18NLocale
                error: I18NError
            }

            type I18NLocaleListResponse {
                data: [I18NLocale]
                meta: I18NListMeta
                error: I18NError
            }

            type SearchLocaleCodesResponse {
                data: [String]
            }

            type I18NInformationLocale {
                code: String
                default: Boolean
            }

            type I18NInformationCurrentLocale {
                context: String
                locale: String
            }

            type I18NInformationResponse {
                locales: [I18NInformationLocale]
                currentLocales: [I18NInformationCurrentLocale]
                defaultLocale: I18NInformationLocale
            }

            type I18NQuery {
                getI18NLocale(code: String!): I18NLocaleResponse
                listI18NLocales: I18NLocaleListResponse
                getI18NInformation: I18NInformationResponse
                searchLocaleCodes(search: String): SearchLocaleCodesResponse
                version: String
            }

            type I18NMutation {
                createI18NLocale(data: I18NLocaleInput!): I18NLocaleResponse
                updateI18NLocale(code: String!, data: I18NLocaleInput!): I18NLocaleResponse
                deleteI18NLocale(code: String!): I18NLocaleResponse
                install(data: I18NInstallInput!): I18NBooleanResponse
            }
        `,
        resolvers: {
            Query: {
                i18n: (_, __, context) => {
                    return new I18NQueryResolver(context);
                }
            },
            Mutation: {
                i18n: (_, __, context) => {
                    return new I18NMutationResolver(context);
                }
            }
        }
    }
};

export default plugin;
