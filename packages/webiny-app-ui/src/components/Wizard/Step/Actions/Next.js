import React from "react";
import { createComponent, i18n } from "webiny-app";
import _ from "lodash";

const t = i18n.namespace("Webiny.Ui.Wizard.Actions.Previous");
class Next extends React.Component {
    render() {
        const { Button, onClick, render, wizard, ...props } = this.props;

        if (render) {
            return render.call(this);
        }

        if (wizard.isLastStep()) {
            return null;
        }

        const btnProps = {
            type: "primary",
            onClick: async () => {
                await onClick();
                this.wizard.form.validate().then(valid => valid && wizard.nextStep());
            },
            align: "right",
            icon: ['fa', 'arrow-circle-right'],
            ...props
        };

        return <Button {...btnProps} />;
    }
}

// Receives all standard Button component props
Next.defaultProps = {
    wizard: null,
    onClick: _.noop,
    label: t`Next`
};

export default createComponent(Next, { modules: ["Button"] });
