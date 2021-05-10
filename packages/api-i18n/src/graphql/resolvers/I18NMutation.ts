import { SecurityContext } from "@webiny/api-security/types";
import { ErrorResponse, NotFoundResponse, Response } from "@webiny/handler-graphql";
import { I18NContext } from "~/types";
import NotAuthorizedResponse from "@webiny/api-security/NotAuthorizedResponse";

type Context = I18NContext & SecurityContext;

export class I18NMutationResolver {
    private context: Context;

    constructor(context: Context) {
        this.context = context;
    }

    async install({ data }) {
        try {
            await this.context.i18n.system.install(data);
        } catch (e) {
            return new ErrorResponse({
                code: e.code,
                message: e.message,
                data: e.data
            });
        }

        return new Response(true);
    }

    async createI18NLocale({ data }) {
        const { i18n, security } = this.context;

        const permission = await security.getPermission("i18n.locale");

        if (!permission) {
            return new NotAuthorizedResponse();
        }

        if (await i18n.locales.getByCode(data.code)) {
            return new NotFoundResponse(`Locale with key "${data.code}" already exists.`);
        }

        await i18n.locales.create(data);
        if (data.default) {
            await i18n.locales.updateDefault(data.code);
        }

        return new Response(data);
    }

    async updateI18NLocale(args) {
        const { i18n, security } = this.context;

        const permission = await security.getPermission("i18n.locale");

        if (!permission) {
            return new NotAuthorizedResponse();
        }

        const locale = await i18n.locales.getByCode(args.code);
        if (!locale) {
            return new NotFoundResponse(`Locale "${args.code}" not found.`);
        }

        await i18n.locales.update(args.code, {
            default: args.default
        });

        if (locale.default) {
            await i18n.locales.updateDefault(args.code);
        }

        return new Response(locale);
    }
    async deleteI18NLocale({ code }) {
        const { i18n, security } = this.context;

        const permission = await security.getPermission("i18n.locale");

        if (!permission) {
            return new NotAuthorizedResponse();
        }

        const locale = await i18n.locales.getByCode(code);
        if (!locale) {
            return new NotFoundResponse(`Locale "${code}" not found.`);
        }

        if (locale.default) {
            return new ErrorResponse({
                message: "Cannot delete default locale, please set another locale as default first."
            });
        }

        const allLocales = await i18n.locales.list();
        if (allLocales.length === 1) {
            return new ErrorResponse({
                message: "Cannot delete the last locale."
            });
        }

        await i18n.locales.delete(code);

        return new Response(locale);
    }
}
