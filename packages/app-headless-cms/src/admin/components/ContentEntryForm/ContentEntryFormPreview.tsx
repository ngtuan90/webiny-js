import React, { useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { Form, FormRenderPropParams } from "@webiny/form";
import { plugins } from "@webiny/plugins";
import RenderFieldElement from "./RenderFieldElement";
import {
    CmsContentFormRendererPlugin,
    CmsEditorContentModel,
    CmsEditorFieldRendererPlugin
} from "~/types";
import { Fields } from "~/admin/components/ContentEntryForm/Fields";

const FormWrapper = styled("div")({
    height: "calc(100vh - 260px)",
    overflow: "auto"
});

interface Props {
    contentModel: CmsEditorContentModel;
}

export const ContentEntryFormPreview = (props: Props) => {
    const { contentModel } = props;

    const renderPlugins = useMemo(
        () => plugins.byType<CmsEditorFieldRendererPlugin>("cms-editor-field-renderer"),
        []
    );

    const formRenderer = plugins
        .byType<CmsContentFormRendererPlugin>("cms-content-form-renderer")
        .find(pl => pl.modelId === contentModel.modelId);

    const renderCustomLayout = useCallback(
        (formRenderProps: FormRenderPropParams) => {
            const fields = contentModel.fields.reduce((acc, field) => {
                acc[field.fieldId] = (
                    <RenderFieldElement
                        field={field}
                        Bind={formRenderProps.Bind}
                        renderPlugins={renderPlugins}
                        contentModel={contentModel}
                    />
                );

                return acc;
            }, {});
            return formRenderer.render({ ...formRenderProps, contentModel, fields });
        },
        [formRenderer]
    );

    return (
        <Form>
            {formProps => (
                <FormWrapper data-testid={"cms-content-form"}>
                    {formRenderer ? (
                        renderCustomLayout(formProps)
                    ) : (
                        <Fields
                            contentModel={contentModel}
                            renderPlugins={renderPlugins}
                            fields={contentModel.fields}
                            layout={contentModel.layout}
                            {...formProps}
                        />
                    )}
                    <pre>{JSON.stringify(formProps.data, null, 2)}</pre>
                </FormWrapper>
            )}
        </Form>
    );
};
