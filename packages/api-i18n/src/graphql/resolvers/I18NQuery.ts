import localesList from "i18n-locales";
import { SecurityContext } from "@webiny/api-security/types";
import { I18NContext } from "~/types";
import NotAuthorizedResponse from "@webiny/api-security/NotAuthorizedResponse";
import { NotFoundResponse, Response } from "@webiny/handler-graphql";

type Context = I18NContext & SecurityContext;

interface I18NQuery {
    getI18NLocale(params: { code: string }): Promise<Response | NotFoundResponse>;
    getI18NInformation(): Promise<{ currentLocales; defaultLocale; locales }>;
    listI18NLocales(): Promise<Response | NotFoundResponse>;
    searchLocaleCodes(params: { search: string }): Promise<Response>;
    version(): Promise<string | null>;
}

export class I18NQueryResolver implements I18NQuery {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    async getI18NLocale({ code }) {
        const { i18n, security } = this.context;

        const permission = await security.getPermission("i18n.locale");

        if (!permission) {
            return new NotAuthorizedResponse();
        }

        const locale = await i18n.locales.getByCode(code);
        if (!locale) {
            return new NotFoundResponse(`Locale "${code}" not found.`);
        }

        return new Response(locale);
    }

    async getI18NInformation() {
        const { i18n } = this.context;
        return {
            currentLocales: i18n.getCurrentLocales(),
            defaultLocale: i18n.getDefaultLocale(),
            locales: i18n.getLocales()
        };
    }

    async listI18NLocales() {
        const { i18n, security } = this.context;
        const permission = await security.getPermission("i18n.locale");

        if (!permission) {
            return new NotAuthorizedResponse();
        }
        return new Response(await i18n.locales.list());
    }

    async searchLocaleCodes({ search }) {
        const query = typeof search === "string" ? search.toLowerCase() : "";
        return new Response(localesList.filter(item => item.toLowerCase().includes(query)));
    }

    async version() {
        const { security, i18n } = this.context;
        if (!security.getTenant()) {
            return null;
        }

        return i18n.system.getVersion();
    }
}
