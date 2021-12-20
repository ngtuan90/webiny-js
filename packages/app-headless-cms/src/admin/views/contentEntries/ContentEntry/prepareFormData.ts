import { CmsEditorContentModel, CmsEditorField, CmsFieldValueTransformer } from "~/types";
import { plugins } from "@webiny/plugins";

interface AvailableFieldTransformers {
    [fieldType: string]: CmsFieldValueTransformer;
}

interface FieldTransformers {
    [fieldId: string]: (value: any) => any;
}

const getAvailableTransformerPlugins = (): AvailableFieldTransformers => {
    return plugins
        .byType<CmsFieldValueTransformer>("cms-field-value-transformer")
        .reduce((transformers, pl) => {
            const fieldTypes = Array.isArray(pl.fieldType) ? pl.fieldType : [pl.fieldType];
            for (const fieldType of fieldTypes) {
                if (transformers[fieldType]) {
                    console.warn(
                        `Transformer for field type "${fieldType}" is already defined. There cannot be more than one transformer.`
                    );
                    continue;
                }
                transformers[fieldType] = pl;
            }
            return transformers;
        }, {});
};

const createTransformers = (fields: CmsEditorField[]): FieldTransformers => {
    const transformerPlugins = getAvailableTransformerPlugins();
    const transformers = {};
    for (const field of fields) {
        if (!transformerPlugins[field.type]) {
            continue;
        }
        transformers[field.fieldId] = (value: any) => {
            return transformerPlugins[field.type].transform(value, field);
        };
    }
    return transformers;
};

export const prepareFormData = (
    input: Record<string, any>,
    model: CmsEditorContentModel
): Record<string, any> => {
    const transformers = createTransformers(model.fields);

    return Object.keys(transformers).reduce((output, key) => {
        const value = input[key];
        const transform = transformers[key];

        const transformedValue = transform(value);
        if (transformedValue === undefined) {
            return output;
        }
        output[key] = transformedValue;

        return output;
    }, input);
};
