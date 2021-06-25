import React, { useCallback } from "react";
import { set } from "dot-prop-immutable";
import { FieldEditor, useFieldEditor } from "~/admin/components/FieldEditor";

export const ObjectFields = ({ field }) => {
    const { getField, updateField } = useFieldEditor();

    const onChange = useCallback(
        ({ fields, layout }) => {
            const currentField = getField({ id: field.id });
            const updatedField = set(currentField, `settings`, settings => {
                return { ...settings, fields, layout };
            });
            updateField(updatedField);
        },
        [field.id]
    );

    return (
        <FieldEditor
            fields={field.settings.fields}
            layout={field.settings.layout}
            onChange={onChange}
        />
    );
};
