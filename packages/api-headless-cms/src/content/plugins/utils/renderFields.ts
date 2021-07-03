import { CmsFieldTypePlugins, CmsContentModel, CmsModelFieldDefinition } from "~/types";

interface RenderFields {
    (params: {
        model: CmsContentModel;
        type: string;
        fieldTypePlugins: CmsFieldTypePlugins;
    }): CmsModelFieldDefinition[];
}

export const renderFields: RenderFields = ({ model, type, fieldTypePlugins }) => {
    return model.fields
        .map(field => renderField({ model, type, field, fieldTypePlugins }))
        .filter(Boolean);
};

export const renderField = ({ model, type, field, fieldTypePlugins }) => {
    const plugin = fieldTypePlugins[field.type];
    if (!plugin) {
        // Let's not render the field if it does not exist in the field plugins.
        return;
    }
    const defs = fieldTypePlugins[field.type][type].createTypeField({
        model,
        field,
        fieldTypePlugins
    });

    if (typeof defs === "string") {
        return { fields: defs };
    }

    return defs;
};
