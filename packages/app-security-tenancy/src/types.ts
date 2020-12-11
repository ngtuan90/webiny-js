import * as React from "react";
import { Plugin } from "@webiny/plugins/types";
import { BindComponent } from "@webiny/form/Bind";
import { SecurityPermission } from "@webiny/app-security/SecurityIdentity";

export type SecurityViewProps = {
    Bind: BindComponent;
    data: { [key: string]: any };
};

export type Tenant = {
    id: string;
    name: string;
    group: string;
    permissions: SecurityPermission[];
};

export type SecurityInstallationFormPlugin = Plugin & {
    type: "security-installation-form";
    render(params: SecurityViewProps): React.ReactNode;
};

export type SecurityUserFormPlugin = Plugin & {
    type: "security-user-form";
    render(params: SecurityViewProps): React.ReactNode;
};

export type SecurityUserAccountFormPlugin = Plugin & {
    type: "security-user-account-form";
    render(params: SecurityViewProps): React.ReactNode;
};

export type PermissionRendererSecurityPlugin = Plugin & {
    type: "permission-renderer-security";
    key: string;
    label: string;
    render: (
        value: SecurityPermission,
        setValue: (newValue: SecurityPermission) => void
    ) => React.ReactElement;
};
