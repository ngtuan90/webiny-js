import React, { useCallback, useMemo } from "react";
import styled from "@emotion/styled";
import { Form, FormRenderPropParams } from "@webiny/form";
import { plugins } from "@webiny/plugins";
import { Cell, Grid } from "@webiny/ui/Grid";
import RenderFieldElement from "./RenderFieldElement";
import {
    CmsContentFormRendererPlugin,
    CmsEditorContentModel,
    CmsEditorFieldRendererPlugin
} from "~/types";
import { useContentEntryFormFields } from "~/admin/components/ContentEntryForm/useContentEntryFormFields";

const FormWrapper = styled("div")({
    height: "calc(100vh - 260px)",
    overflow: "auto"
});

interface Props {
    contentModel: CmsEditorContentModel;
}

export const ContentEntryFormPreview = (props: Props) => {
    const { contentModel } = props;
    const { fields } = useContentEntryFormFields(props);

    const renderPlugins = useMemo(
        () => plugins.byType<CmsEditorFieldRendererPlugin>("cms-editor-field-renderer"),
        []
    );

    const formRenderer = plugins
        .byType<CmsContentFormRendererPlugin>("cms-content-form-renderer")
        .find(pl => pl.modelId === contentModel.modelId);

    const renderDefaultLayout = useCallback(({ Bind }: FormRenderPropParams) => {
        return (
            <Grid>
                {fields.map((row, rowIndex) => (
                    <React.Fragment key={rowIndex}>
                        {row.map(field => (
                            <Cell span={Math.floor(12 / row.length)} key={field.id}>
                                <RenderFieldElement
                                    field={field}
                                    Bind={Bind}
                                    renderPlugins={renderPlugins}
                                    contentModel={contentModel}
                                />
                            </Cell>
                        ))}
                    </React.Fragment>
                ))}
            </Grid>
        );
    }, []);

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
                    {formRenderer ? renderCustomLayout(formProps) : renderDefaultLayout(formProps)}
                </FormWrapper>
            )}
        </Form>
    );
};
