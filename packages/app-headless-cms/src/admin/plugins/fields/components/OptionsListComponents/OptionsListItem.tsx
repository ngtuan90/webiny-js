import React from "react";
import { I18NValue } from "@webiny/app-i18n/components";
import { I18NInput } from "@webiny/app-i18n/admin/components";
import { Typography } from "@webiny/ui/Typography";
import { Tooltip } from "@webiny/ui/Tooltip";
import { css } from "emotion";
import { IconButton } from "@webiny/ui/Button";

import { Switch } from "@webiny/ui/Switch";
import { ReactComponent as DeleteIcon } from "@webiny/app-headless-cms/admin/icons/__used__icons__/delete.svg";
import { ReactComponent as EditIcon } from "@webiny/app-headless-cms/admin/icons/__used__icons__/edit.svg";

import { ReactComponent as TranslateIcon } from "@webiny/app-headless-cms/admin/icons/round-translate-24px.svg";
import { BindComponent } from "@webiny/form/Bind";

const optionsListItemLeft = css({
    display: "flex",
    justifyContent: "left",
    alignItems: "center",
    ">div": {
        display: "flex",
        flexDirection: "column",
        marginLeft: 10,
        color: "var(--mdc-theme-on-surface)",
        span: {
            lineHeight: "125%"
        }
    }
});

const optionsListItemRight = css({
    display: "flex",
    justifyContent: "right",
    alignItems: "center"
});

type DefaultValueSwitchProps = {
    multiple: boolean;
    option: any;
    value: any;
    onChange: any;
};

const DefaultValueSwitch = ({
    multiple,
    option,
    value: currentDefaultValue,
    onChange: setDefaultValue
}: DefaultValueSwitchProps) => {
    if (multiple) {
        const selected =
            Array.isArray(currentDefaultValue) && currentDefaultValue.includes(option.value);

        return (
            <Switch
                value={selected}
                onChange={() => {
                    if (selected) {
                        const value = Array.isArray(currentDefaultValue)
                            ? [...currentDefaultValue]
                            : [];

                        value.splice(value.indexOf(option.value), 1);
                        setDefaultValue(value);
                    } else {
                        const value = Array.isArray(currentDefaultValue)
                            ? [...currentDefaultValue]
                            : [];
                        value.push(option.value);
                        setDefaultValue(value);
                    }
                }}
            />
        );
    }

    const selected = currentDefaultValue === option.value;
    return (
        <Switch
            value={selected}
            onChange={() => {
                const newValue = selected ? "" : option.value;
                setDefaultValue(newValue);
            }}
        />
    );
};

type OptionsListItemProps = {
    multiple: boolean;
    dragHandle: React.ReactNode;
    Bind: BindComponent;
    option: { label: string; value: string };
    deleteOption: () => void;
    editOption: () => void;
    setOptionTranslations: (label: string) => void;
};

export default function OptionsListItem(props: OptionsListItemProps) {
    const {
        option,
        multiple,
        dragHandle,
        Bind,
        deleteOption,
        editOption,
        setOptionTranslations
    } = props;

    return (
        <>
            <div className={optionsListItemLeft}>
                <Tooltip placement={"bottom"} content={<span>Drag to rearrange the order</span>}>
                    <span>{dragHandle}</span>
                </Tooltip>
                <div>
                    <Typography use={"subtitle1"}>
                        <I18NValue value={option.label} />
                    </Typography>
                    <Typography use={"caption"}>{option.value}</Typography>
                </div>
            </div>
            <div className={optionsListItemRight}>
                <IconButton icon={<EditIcon />} onClick={editOption} />
                <I18NInput value={option.label} onChange={setOptionTranslations}>
                    {({ openDialog }) => {
                        return <IconButton icon={<TranslateIcon />} onClick={openDialog} />;
                    }}
                </I18NInput>

                <IconButton icon={<DeleteIcon />} onClick={deleteOption} />

                <Bind name={"settings.defaultValue"}>
                    {({ onChange, value }) => (
                        <Tooltip placement={"bottom"} content={<span>Set as default value</span>}>
                            <DefaultValueSwitch
                                onChange={onChange}
                                value={value}
                                multiple={multiple}
                                option={option}
                            />
                        </Tooltip>
                    )}
                </Bind>
            </div>
        </>
    );
}
