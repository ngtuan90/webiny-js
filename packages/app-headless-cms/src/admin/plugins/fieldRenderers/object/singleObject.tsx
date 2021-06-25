import React from "react";
import { i18n } from "@webiny/app/i18n";
import { CmsEditorFieldRendererPlugin } from "~/types";
import { Input } from "@webiny/ui/Input";

const t = i18n.ns("app-headless-cms/admin/fields/text");

const plugin: CmsEditorFieldRendererPlugin = {
    type: "cms-editor-field-renderer",
    name: "cms-editor-field-renderer-object",
    renderer: {
        rendererName: "object",
        name: t`Object`,
        description: t`Renders a set of fields.`,
        canUse({ field }) {
            return field.type === "object" && !field.multipleValues;
        },
        render({ field, getBind }) {
            const Bind = getBind();

            return (
                <Bind>
                    {bind => (
                        <Input
                            {...bind}
                            label={field.label}
                            placeholder={field.placeholderText}
                            description={field.helpText}
                        />
                    )}
                </Bind>
            );
        }
    }
};

export default plugin;
