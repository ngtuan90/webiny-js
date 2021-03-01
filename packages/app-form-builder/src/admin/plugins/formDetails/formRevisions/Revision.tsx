import React from "react";
import { css } from "emotion";
import TimeAgo from "timeago-react";
import {
    ListItem,
    ListItemText,
    ListItemTextPrimary,
    ListItemTextSecondary,
    ListItemGraphic,
    ListItemMeta
} from "@webiny/ui/List";
import { IconButton } from "@webiny/ui/Button";
import { Icon } from "@webiny/ui/Icon";
import { MenuItem, Menu, MenuDivider } from "@webiny/ui/Menu";
import { ConfirmationDialog } from "@webiny/ui/ConfirmationDialog";
import { Tooltip } from "@webiny/ui/Tooltip";
import { ReactComponent as AddIcon } from "../../../icons/add.svg";
import { ReactComponent as BeenHereIcon } from "../../../icons/beenhere.svg";
import { ReactComponent as DeleteIcon } from "../../../icons/delete.svg";
import { ReactComponent as EditIcon } from "../../../icons/edit.svg";
import { ReactComponent as GestureIcon } from "../../../icons/gesture.svg";
import { ReactComponent as LockIcon } from "../../../icons/lock.svg";
import { ReactComponent as MoreVerticalIcon } from "../../../icons/more_vert.svg";
import { ReactComponent as PublishIcon } from "../../../icons/publish.svg";
import { ReactComponent as UnpublishIcon } from "../../../icons/unpublish.svg";
import { useRevision } from "./useRevision";
import { FbFormModel } from "../../../../types";
import usePermission from "../../../../hooks/usePermission";

const primaryColor = css({ color: "var(--mdc-theme-primary)" });

const revisionsMenu = css({
    width: 250,
    right: -105,
    left: "auto !important"
});

const getIcon = rev => {
    switch (rev.status) {
        case "locked":
            return {
                icon: <Icon icon={<LockIcon />} />,
                text: "This revision is locked (it has already been published)"
            };
        case "published":
            return {
                icon: <Icon icon={<BeenHereIcon />} className={primaryColor} />,
                text: "This revision is currently published!"
            };
        default:
            return {
                icon: <Icon icon={<GestureIcon />} />,
                text: "This is a draft"
            };
    }
};

type RevisionProps = {
    form: FbFormModel;
    revision: FbFormModel;
};

const Revision = (props: RevisionProps) => {
    const { revision: rev, form } = props;
    const { icon, text: tooltipText } = getIcon(rev);
    const {
        publishRevision,
        createRevision,
        deleteRevision,
        editRevision,
        unpublishRevision
    } = useRevision({ revision: rev, form });
    const { canPublish, canUnpublish, canDelete, canEdit } = usePermission();

    const showMenu = canEdit(form) || canDelete(form) || canPublish() || canUnpublish();

    return (
        <ListItem>
            <ListItemGraphic>
                <Tooltip content={tooltipText} placement={"bottom"}>
                    {icon}
                </Tooltip>
            </ListItemGraphic>
            <ListItemText>
                <ListItemTextPrimary>{rev.name}</ListItemTextPrimary>
                <ListItemTextSecondary>
                    Last modified <TimeAgo datetime={rev.savedOn} /> (#
                    {rev.version})
                </ListItemTextSecondary>
            </ListItemText>
            {showMenu && (
                <ListItemMeta>
                    <Menu
                        handle={<IconButton icon={<MoreVerticalIcon />} />}
                        className={revisionsMenu}
                    >
                        {canEdit(form) && (
                            <MenuItem onClick={createRevision}>
                                <ListItemGraphic>
                                    <Icon icon={<AddIcon />} />
                                </ListItemGraphic>
                                New from current
                            </MenuItem>
                        )}
                        {rev.status === "draft" && canEdit(form) && (
                            <MenuItem onClick={editRevision}>
                                <ListItemGraphic>
                                    <Icon icon={<EditIcon />} />
                                </ListItemGraphic>
                                Edit
                            </MenuItem>
                        )}

                        {rev.status !== "published" && canPublish() && (
                            <MenuItem onClick={() => publishRevision(rev)}>
                                <ListItemGraphic>
                                    <Icon icon={<PublishIcon />} />
                                </ListItemGraphic>
                                Publish
                            </MenuItem>
                        )}

                        {rev.status === "published" && canUnpublish() && (
                            <ConfirmationDialog
                                title="Confirmation required!"
                                message={
                                    <span>Are you sure you want to unpublish this revision?</span>
                                }
                            >
                                {({ showConfirmation }) => (
                                    <MenuItem
                                        onClick={() =>
                                            showConfirmation(() => unpublishRevision(rev))
                                        }
                                    >
                                        <ListItemGraphic>
                                            <Icon icon={<UnpublishIcon />} />
                                        </ListItemGraphic>
                                        Unpublish
                                    </MenuItem>
                                )}
                            </ConfirmationDialog>
                        )}

                        <MenuDivider />

                        {canDelete(form) && (
                            <ConfirmationDialog
                                title="Confirmation required!"
                                message={
                                    <span>Are you sure you want to delete this revision?</span>
                                }
                            >
                                {({ showConfirmation }) => (
                                    <MenuItem onClick={() => showConfirmation(deleteRevision)}>
                                        <ListItemGraphic>
                                            <Icon icon={<DeleteIcon />} />
                                        </ListItemGraphic>
                                        Delete
                                    </MenuItem>
                                )}
                            </ConfirmationDialog>
                        )}
                    </Menu>
                </ListItemMeta>
            )}
        </ListItem>
    );
};

export default Revision;
