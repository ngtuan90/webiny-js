import {FormRenderPropParams} from "@webiny/form";
import {Cell, Grid} from "@webiny/ui/Grid";
import React from "react";
import RenderFieldElement from "./RenderFieldElement";
import {CmsEditorField} from "~/types";

interface Props extends FormRenderPropParams {
    fields: CmsEditorField[][]
}

export const Fields = ({ Bind, fields }: Props) => {
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
    )
}
