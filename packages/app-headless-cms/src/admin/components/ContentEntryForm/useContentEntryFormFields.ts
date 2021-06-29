import { useCallback, useMemo } from "react";
import cloneDeep from "lodash/cloneDeep";

import { CmsEditorContentModel, CmsEditorField } from "~/types";

interface UseContentEntryFormFields {
    getFieldById: (id: string) => CmsEditorField;
    fields: CmsEditorField[][];
}

export interface UseContentEntryFormFieldsParams {
    contentModel: CmsEditorContentModel;
}

export function useContentEntryFormFields({
    contentModel
}: UseContentEntryFormFieldsParams): UseContentEntryFormFields {
    const fieldsHash = JSON.stringify([contentModel.fields, contentModel.layout]);

    const getFieldById = useCallback(
        id => {
            return contentModel.fields.find(field => field.id === id);
        },
        [fieldsHash]
    );

    const fields = useMemo(() => {
        let returnFields;
        if (contentModel.layout) {
            returnFields = cloneDeep(contentModel.layout);
        } else {
            // If no layout was provided, just render each field in a new row.
            returnFields = [...fields.map(item => [item.id])];
        }

        returnFields.forEach(row => {
            row.forEach((id, idIndex) => {
                row[idIndex] = getFieldById(id);
            });
        });

        return returnFields;
    }, [fieldsHash]);

    return {
        getFieldById,
        fields
    };
}
