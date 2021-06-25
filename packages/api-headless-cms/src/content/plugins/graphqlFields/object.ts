import { CmsModelFieldToGraphQLPlugin } from "../../../types";

const plugin: CmsModelFieldToGraphQLPlugin = {
    name: "cms-model-field-to-graphql-object",
    type: "cms-model-field-to-graphql",
    fieldType: "object",
    isSortable: false,
    isSearchable: false,
    read: {
        createTypeField({ field }) {
            if (field.multipleValues) {
                return `${field.fieldId}: [JSON]`;
            }

            return `${field.fieldId}: JSON`;
        }
    },
    manage: {
        createTypeField({ field }) {
            if (field.multipleValues) {
                return field.fieldId + ": [JSON]";
            }

            return field.fieldId + ": JSON";
        },
        createInputField({ field }) {
            if (field.multipleValues) {
                return field.fieldId + ": [JSON]";
            }

            return field.fieldId + ": JSON";
        }
    }
};

export default plugin;
