import React from "react";
import styled from "@emotion/styled";
import { View } from "@webiny/ui-composer/View";
import { plugins } from "@webiny/plugins";
import { Form } from "@webiny/form";
import { validation } from "@webiny/validation";
import {
    SimpleFormElement,
    SimpleFormElementRenderProps
} from "@webiny/app-admin/elements/SimpleFormElement";
import { GenericElement } from "@webiny/ui-elements/GenericElement";
import { AccordionElement, AccordionItemElement } from "@webiny/ui-elements/AccordionElement";
import { InputElement } from "@webiny/ui-elements/InputElement";
import { ReactComponent as SecurityIcon } from "../../assets/icons/security-24px.svg";
import { ReactComponent as SettingsIcon } from "~/assets/icons/settings-24px.svg";
import { UseUserForm } from "./hooks/useUserForm";
import AvatarImage from "../Components/AvatarImage";
import { GroupAutocompleteElement } from "~/elements/GroupAutocompleteElement";
import { UsersFormViewPlugin } from "./UsersFormViewPlugin";

const FormWrapper = styled("div")({
    margin: "0 100px"
});

const AvatarWrapper = styled("div")({
    margin: "24px 100px 32px"
});

export class UsersFormView extends View<UseUserForm> {
    constructor() {
        super("users-form-view");

        // Setup default view
        this.addElements();

        // Apply plugins
        plugins
            .byType<UsersFormViewPlugin>(UsersFormViewPlugin.type)
            .forEach(plugin => plugin.apply(this));
    }

    submit(data: FormData, form?: Form) {
        this.dispatchEvent("onSubmit", { data, form });
        this.hookValues.onSubmit(data);
    }

    onSubmit(cb: (data: any, form: Form) => void) {
        this.addEventListener("onSubmit", cb);
    }

    private addElements() {
        const simpleForm = this.addElement(
            new SimpleFormElement("users-form", {
                isLoading: () => {
                    return this.hookValues.loading;
                },
                onSubmit: (data: FormData, form: Form) => {
                    this.submit(data, form);
                },
                getTitle: () => {
                    return this.hookValues.fullName || "New User";
                },
                getFormData: () => {
                    return this.hookValues.user;
                },
                onCancel: () => {
                    this.hookValues.cancelEditing();
                }
            })
        ) as SimpleFormElement;

        const avatar = new GenericElement<SimpleFormElementRenderProps>("avatar", props => {
            const { Bind } = props.formProps;

            return (
                <AvatarWrapper>
                    <Bind name="avatar">
                        <AvatarImage round />
                    </Bind>
                </AvatarWrapper>
            );
        });

        avatar.moveAbove(simpleForm.getFormContainer());

        const accordion = new AccordionElement("accordion", {
            items: [
                {
                    id: "bio",
                    title: "Bio",
                    open: true,
                    description: "Account information",
                    icon: <SettingsIcon />
                },
                {
                    id: "groups",
                    title: "Groups",
                    description: "Assign to security group",
                    icon: <SecurityIcon />
                }
            ]
        });

        simpleForm.getFormContentElement().toggleGrid(false);
        simpleForm.getFormContentElement().addElement(accordion);

        const bioAccordion = accordion.getAccordionItemElement("bio");
        bioAccordion.addElement(
            new InputElement("firstName", {
                label: "First Name",
                validators: validation.create("required")
            })
        );
        bioAccordion.addElement(
            new InputElement("lastName", {
                label: "Last Name",
                validators: validation.create("required")
            })
        );

        bioAccordion.addElement(
            new InputElement("login", {
                label: "Email",
                validators: validation.create("required,email"),
                beforeChange: (value: string, cb) => cb(value.toLowerCase()),
                shouldRender(props) {
                    return props.formProps.data.firstName === "Pavel";
                }
            })
        );

        bioAccordion.getElement<InputElement>("login").setIsDisabled(true);

        const groupAccordion = accordion.getElement<AccordionItemElement>("groups");
        groupAccordion.addElement(
            new GroupAutocompleteElement("group", {
                label: "Group",
                validators: validation.create("required")
            })
        );

        this.toggleGrid(false);
        this.wrapWith(FormWrapper);

        // MODIFY THE FORM BEYOND RECOGNIZABLE!
        // const leftIds = ["firstName", "lastName"];
        // const rightIds = ["login", "group"];
        //
        // // Add left and right panels
        // const leftPanel = new PanelElement("leftPanel");
        // const rightPanel = new PanelElement("rightPanel");
        //
        // const formContent = simpleForm.getFormContentElement();
        // leftPanel.moveToTheTopOf(formContent);
        // rightPanel.moveToTheRightOf(leftPanel);
        //
        // leftIds.forEach(id => this.getElement(id).moveToTheBottomOf(leftPanel));
        // rightIds.forEach(id => this.getElement(id).moveToTheBottomOf(rightPanel));
        //
        // const extraData = new InputElement("extra", { label: "Extra Data" });
        // extraData.moveToTheRightOf(this.getElement("login"));
        //
        // formContent.toggleGrid(true);
        // simpleForm.getFormHeaderElement().setIcon(<SecurityIcon />);
        // simpleForm.getSubmitButtonElement().moveTo(simpleForm.getFormHeaderElement());
        //
        // accordion.removeElement();
    }
}
