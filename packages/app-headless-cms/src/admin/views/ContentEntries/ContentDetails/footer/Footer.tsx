import React from "react";
import { css } from "emotion";
import { Grid, Cell } from "@webiny/ui/Grid";
import classNames from "classnames";
import SubmitButton from "./SubmitButton";

const toolbarGrid = css({
    borderTop: "1px solid var(--mdc-theme-on-background)"
});

const footerActions = css({
    display: "flex",
    alignItems: "center"
});

const footerActionsLeft = css({
    justifyContent: "flex-end"
});

const footerActionsRight = css({
    justifyContent: "flex-start"
});

const Footer = props => {
    return (
        <React.Fragment>
            <Grid className={toolbarGrid}>
                <Cell span={6} className={classNames(footerActions, footerActionsRight)}>
                    {/* At some point we'll add a plugin hook here */}
                </Cell>
                <Cell span={6} className={classNames(footerActions, footerActionsLeft)}>
                    <SubmitButton {...props} />
                </Cell>
            </Grid>
        </React.Fragment>
    );
};

export default Footer;
