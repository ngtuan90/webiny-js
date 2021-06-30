import React from "react";
import { ReactComponent as BooleanIcon } from "./icons/toggle_on-black-24px.svg";
import { CmsEditorFieldTypePlugin } from "~/types";
import { i18n } from "@webiny/app/i18n";
import { ObjectFields } from "./object/ObjectFields";

const t = i18n.ns("app-headless-cms/admin/fields");

const plugin: CmsEditorFieldTypePlugin = {
    type: "cms-editor-field-type",
    name: "cms-editor-field-type-object",
    field: {
        type: "object",
        label: t`Object`,
        description: t`Store objects.`,
        icon: <BooleanIcon />,
        allowMultipleValues: true,
        allowPredefinedValues: false,
        multipleValuesLabel: t`Use as a repeatable object`,
        createField() {
            return {
                type: this.type,
                validation: [],
                settings: {
                    fields: [],
                    layout: []
                },
                renderer: {
                    name: ""
                }
            };
        },
        render(props) {
            return <ObjectFields {...props} />;
        }
    }
};

export default plugin;
