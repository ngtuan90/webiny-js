import React, { useCallback, useReducer } from "react";
import shortid from "shortid";
import useDeepCompareEffect from "use-deep-compare-effect";
import cloneDeep from "lodash/cloneDeep";
import {
    CmsEditorField,
    CmsEditorFieldId,
    CmsEditorFieldsLayout,
    CmsEditorFieldTypePlugin,
    FieldLayoutPosition
} from "~/types";
import { plugins } from "@webiny/plugins";
import * as utils from "./utils";
import { FieldEditorProps } from "./FieldEditor";
import { DragObjectWithType } from "react-dnd";

interface DropTarget {
    row: number;
    index: number;
}

interface Position {
    row: number;
    index: number;
}

interface DragSource extends DragObjectWithType {
    pos: Partial<Position>;
    ui: string;
}

export interface FieldEditorContextValue {
    fields: CmsEditorField[][];
    layout: CmsEditorFieldsLayout;
    onChange?: (data: any) => void;
    getFieldsInLayout: () => CmsEditorField[][];
    getFieldPlugin: (type: string) => CmsEditorFieldTypePlugin;
    getField: (query: Record<string, string>) => CmsEditorField;
    editField: (field: CmsEditorField) => void;
    field: CmsEditorField;
    dropTarget?: DropTarget;
    onFieldDrop: (source: Partial<DragSource>, target: DropTarget) => void;
    insertField: (data: CmsEditorField, position: FieldLayoutPosition) => void;
    moveField: (params: {
        field: CmsEditorFieldId | CmsEditorField;
        position: FieldLayoutPosition;
    }) => void;
    moveRow: (source: number, destination: number) => void;
    updateField: (field: CmsEditorField) => void;
    deleteField: (field: CmsEditorField) => void;
    getFieldPosition: (field: CmsEditorFieldId | CmsEditorField) => Position | null;
}

interface FieldEditorProviderProps extends FieldEditorProps {
    children: React.ReactElement;
}

export const FieldEditorContext = React.createContext<FieldEditorContextValue>(null);

export const FieldEditorProvider = ({
    fields,
    layout,
    onChange,
    children
}: FieldEditorProviderProps) => {
    const [state, setState] = useReducer(
        (prev, next) => {
            if (typeof next === "function") {
                return { ...prev, ...next(cloneDeep(prev)) };
            }
            return { ...prev, ...next };
        },
        {
            layout,
            fields,
            field: null,
            dropTarget: null
        }
    );

    useDeepCompareEffect(() => {
        onChange({ fields: state.fields, layout: state.layout });
    }, [state.fields, state.layout]);

    const editField = useCallback(field => {
        setState({ field: cloneDeep(field) });
    }, []);

    const onFieldDrop = useCallback<FieldEditorContextValue["onFieldDrop"]>(
        (source, dropTarget) => {
            const { pos, type, ui } = source;

            if (ui === "row") {
                // Reorder rows.
                // Reorder logic is different depending on the source and target position.
                return moveRow(pos.row, dropTarget.row);
            }

            // If source pos is set, we are moving an existing field.
            if (pos) {
                const fieldId = state.layout[pos.row][pos.index];
                return moveField({ field: fieldId, position: dropTarget });
            }

            const plugin = getFieldPlugin(type.toString());
            editField(plugin.field.createField());
            setState({ dropTarget });
        },
        []
    );

    const getFieldsInLayout: FieldEditorContextValue["getFieldsInLayout"] = () => {
        // Replace every field ID with actual field object.
        const fields = cloneDeep(state.layout.filter(arr => arr.length));
        fields.forEach((row, rowIndex) => {
            row.forEach((fieldId, fieldIndex) => {
                fields[rowIndex][fieldIndex] = getField({ id: fieldId });
            });
        });
        return fields;
    };

    /**
     * Return field plugin.
     */
    const getFieldPlugin: FieldEditorContextValue["getFieldPlugin"] = type => {
        return plugins
            .byType<CmsEditorFieldTypePlugin>("cms-editor-field-type")
            .find(({ field }) => field.type === type);
    };

    /**
     * Checks if field of given type already exists in the list of fields.
     */
    const getField: FieldEditorContextValue["getField"] = query => {
        return state.fields.find(field => {
            for (const key in query) {
                if (!(key in field)) {
                    return null;
                }

                if (field[key] !== query[key]) {
                    return null;
                }
            }

            return true;
        });
    };

    /**
     * Inserts a new field into the target position.
     */
    const insertField: FieldEditorContextValue["insertField"] = (data, position) => {
        const field = cloneDeep(data);
        if (!field.id) {
            field.id = shortid.generate();
        }

        if (!data.type) {
            throw new Error(`Field "type" missing.`);
        }

        const fieldPlugin = getFieldPlugin(data.type);
        if (!fieldPlugin) {
            throw new Error(`Invalid field "type".`);
        }

        setState(data => {
            if (!Array.isArray(data.fields)) {
                data.fields = [];
            }
            data.fields.push(field);

            utils.moveField({ field, position, data });

            // We are dropping a new field at the specified index.
            return data;
        });
    };

    /**
     * Moves field to the given target position.
     */
    const moveField: FieldEditorContextValue["moveField"] = ({ field, position }) => {
        setState(data => {
            utils.moveField({ field, position, data });
            return data;
        });
    };

    /**
     * Moves row to a destination row.
     */
    const moveRow: FieldEditorContextValue["moveRow"] = (source, destination) => {
        setState(data => {
            utils.moveRow({ data, source, destination });
            return data;
        });
    };

    /**
     * Updates field.
     * @param fieldData
     */
    const updateField: FieldEditorContextValue["updateField"] = fieldData => {
        const field = cloneDeep(fieldData);
        setState(data => {
            for (let i = 0; i < data.fields.length; i++) {
                if (data.fields[i].id === field.id) {
                    data.fields[i] = field;
                    break;
                }
            }
            return data;
        });
    };

    /**
     * Deletes a field (both from the list of field and the layout).
     */
    const deleteField: FieldEditorContextValue["deleteField"] = field => {
        setState(data => {
            utils.deleteField({ field, data });
            return data;
        });
    };

    /**
     * Returns row / index position for given field.
     */
    const getFieldPosition: FieldEditorContextValue["getFieldPosition"] = field => {
        return utils.getFieldPosition({ field, data: state });
    };

    const value = {
        getFieldsInLayout,
        getFieldPlugin,
        getField,
        editField,
        field: state.field,
        dropTarget: state.dropTarget,
        onFieldDrop,
        insertField,
        moveField,
        moveRow,
        updateField,
        deleteField,
        getFieldPosition,
        fields: getFieldsInLayout(),
        layout: state.layout
    };

    return <FieldEditorContext.Provider value={value}>{children}</FieldEditorContext.Provider>;
};
