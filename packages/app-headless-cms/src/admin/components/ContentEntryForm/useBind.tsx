import React, { useRef, useCallback, cloneElement } from "react";
import { BindComponentRenderProp } from "@webiny/form";
import { createValidators } from "./functions/createValidators";

interface FieldBindProps extends BindComponentRenderProp {
    appendValue: (value: any) => void;
    prependValue: (value: any) => void;
    appendValues: (values: any[]) => void;
    removeValue: (index: number) => void;
}

export function useBind({ Bind: ParentBind, field }) {
    const memoizedBindComponents = useRef({});

    return useCallback(
        (index = -1) => {
            const { parentName } = ParentBind;
            const name = [parentName, field.fieldId, index >= 0 ? index : undefined]
                .filter(v => v !== undefined)
                .join(".");

            if (memoizedBindComponents.current[name]) {
                return memoizedBindComponents.current[name];
            }

            const validators = createValidators(field.validation || []);
            const listValidators = createValidators(field.listValidation || []);
            const defaultValue = field.multipleValues ? [] : undefined;
            const isMultipleValues = index === -1 && field.multipleValues;

            memoizedBindComponents.current[name] = function UseBind({ name: childName, children }) {
                return (
                    <ParentBind
                        name={childName || name}
                        validators={isMultipleValues ? listValidators : validators}
                        defaultValue={index === -1 ? defaultValue : null}
                    >
                        {bind => {
                            // Multiple-values functions below.
                            const props: Partial<FieldBindProps> = { ...bind };
                            if (field.multipleValues && index === -1) {
                                props.appendValue = newValue => {
                                    bind.onChange([...bind.value, newValue]);
                                };
                                props.prependValue = newValue => {
                                    bind.onChange([newValue, ...bind.value]);
                                };
                                props.appendValues = newValues => {
                                    bind.onChange([...bind.value, ...newValues]);
                                };

                                props.removeValue = index => {
                                    if (index >= 0) {
                                        let value = bind.value;
                                        value = [
                                            ...value.slice(0, index),
                                            ...value.slice(index + 1)
                                        ];

                                        bind.onChange(value);

                                        // To make sure the field is still valid, we must trigger validation.
                                        bind.form.validateInput(field.fieldId);
                                    }
                                };
                            }

                            if (typeof children === "function") {
                                return children(props);
                            }

                            return cloneElement(children, props);
                        }}
                    </ParentBind>
                );
            };

            memoizedBindComponents.current[name].parentName = name;

            return memoizedBindComponents.current[name];
        },
        [field.fieldId]
    );
}
