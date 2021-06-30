import React from "react";
import { BindComponent, FormRenderPropParams } from "@webiny/form";
import { Cell, Grid } from "@webiny/ui/Grid";
import RenderFieldElement from "./RenderFieldElement";
import {
    CmsEditorContentModel,
    CmsEditorField,
    CmsEditorFieldRendererPlugin,
    CmsEditorFieldsLayout
} from "~/types";

interface Props {
    Bind: BindComponent;
    contentModel: CmsEditorContentModel;
    fields: CmsEditorField[];
    layout: CmsEditorFieldsLayout;
    renderPlugins: CmsEditorFieldRendererPlugin[];
}

const getFieldById = (fields, id) => fields.find(field => field.id === id);

export const Fields = ({ Bind, fields, layout, renderPlugins, contentModel }: Props) => {
    return (
        <Grid>
            {layout.map((row, rowIndex) => (
                <React.Fragment key={rowIndex}>
                    {row.map(fieldId => (
                        <Cell span={Math.floor(12 / row.length)} key={fieldId}>
                            <RenderFieldElement
                                field={getFieldById(fields, fieldId)}
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
};
