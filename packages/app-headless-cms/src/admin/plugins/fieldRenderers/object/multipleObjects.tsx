import React from "react";
import get from "lodash/get";
import { i18n } from "@webiny/app/i18n";
import { CmsEditorFieldRendererPlugin } from "~/types";
import { ReactComponent as DeleteIcon } from "~/admin/icons/close.svg";
import DynamicSection from "../DynamicSection";
import { Input } from "@webiny/ui/Input";

const t = i18n.ns("app-headless-cms/admin/fields/text");

const plugin: CmsEditorFieldRendererPlugin = {
    type: "cms-editor-field-renderer",
    name: "cms-editor-field-renderer-objects",
    renderer: {
        rendererName: "objects",
        name: t`Objects`,
        description: t`Renders a set of fields.`,
        canUse({ field }) {
            return field.type === "text" && field.multipleValues;
        },
        render(props) {
            return (
                <DynamicSection {...props}>
                    {({ bind, index }) => (
                        <Input
                            {...bind.index}
                            autoFocus
                            onEnter={() => bind.field.appendValue("")}
                            label={t`Value {number}`({ number: index + 1 })}
                            trailingIcon={
                                index > 0 && {
                                    icon: <DeleteIcon />,
                                    onClick: () => bind.field.removeValue(index)
                                }
                            }
                        />
                    )}
                </DynamicSection>
            );
        }
    }
};

export default plugin;
