import React, { Fragment, useCallback, useMemo, useState } from "react";
import isEmpty from "lodash/isEmpty";
import get from "lodash/get";
import { css } from "emotion";
import { useRouter } from "@webiny/react-router";
import styled from "@emotion/styled";
import { useSnackbar } from "@webiny/app-admin/hooks/useSnackbar";
import EmptyView from "@webiny/app-admin/components/EmptyView";
import { ButtonDefault, ButtonIcon } from "@webiny/ui/Button";
import { ReactComponent as AddIcon } from "@webiny/app-admin/assets/icons/add-18px.svg";
import { i18n } from "@webiny/app/i18n";
import { Tab, Tabs } from "@webiny/ui/Tabs";
import { Elevation } from "@webiny/ui/Elevation";
import { CircularProgress } from "@webiny/ui/Progress";
import { useQuery } from "../../hooks";
import * as GQL from "~/admin/components/ContentEntryForm/graphql";
import RevisionsList from "./ContentDetails/RevisionsList";
import Header from "./ContentDetails/header/Header";
import ContentForm from "./ContentDetails/contentForm/ContentForm";
import Footer from "./ContentDetails/footer/Footer";

const t = i18n.namespace("app-headless-cms/admin/content-model-entries/details");

const DetailsContainer = styled("div")({
    height: "calc(100% - 10px)",
    overflow: "hidden",
    position: "relative",
    nav: {
        backgroundColor: "var(--mdc-theme-surface)"
    }
});

const RenderBlock = styled("div")({
    position: "relative",
    zIndex: 0,
    backgroundColor: "var(--mdc-theme-background)",
    height: "100%",
    /*overflow: "scroll",*/
    padding: 25
});

const elevationStyles = css({
    position: "relative"
});

declare global {
    // eslint-disable-next-line
    namespace JSX {
        interface IntrinsicElements {
            "test-id": {
                children?: React.ReactNode;
            };
        }
    }
}
type ContentDetailsProps = {
    canCreate: boolean;
    contentModel: any;
    listQueryVariables: any;
};
const ContentDetails = ({ contentModel, canCreate, listQueryVariables }: ContentDetailsProps) => {
    const { history, location } = useRouter();
    const { showSnackbar } = useSnackbar();
    const [state, setState] = useState({});
    const [loading, setLoading] = useState(false);

    const newEntry = new URLSearchParams(location.search).get("new") === "true";
    const query = new URLSearchParams(location.search);
    const contentId = query.get("id");
    const revisionId = contentId ? decodeURIComponent(contentId) : null;
    const entryId = revisionId ? revisionId.split("#")[0] : null;

    const { READ_CONTENT } = useMemo(() => {
        return {
            READ_CONTENT: GQL.createReadQuery(contentModel)
        };
    }, [contentModel.modelId]);

    const { GET_REVISIONS } = useMemo(() => {
        return {
            GET_REVISIONS: GQL.createRevisionsQuery(contentModel)
        };
    }, [contentModel.modelId]);

    const getEntry = useQuery(READ_CONTENT, {
        variables: { revision: decodeURIComponent(contentId) },
        skip: !contentId,
        onCompleted: data => {
            if (!data) {
                return;
            }

            const { error } = data.content;
            if (error) {
                history.push(`/cms/content-entries/${contentModel.modelId}`);
                showSnackbar(error.message);
            }
        }
    });

    const getRevisions = useQuery(GET_REVISIONS, {
        variables: { id: entryId },
        skip: !entryId
    });

    const getLoading = useCallback(() => loading || getEntry.loading || getRevisions.loading, [
        loading,
        getEntry.loading,
        getRevisions.loading
    ]);

    const entry = get(getEntry, "data.content.data") || {};
    const revisions = get(getRevisions, "data.revisions.data") || {};

    const showEmptyView = !newEntry && !getLoading() && isEmpty(entry);
    // Render "No content selected" view.
    if (showEmptyView) {
        return (
            <EmptyView
                title={t`Click on the left side list to display entry details {message}`({
                    message: canCreate ? "or create a..." : ""
                })}
                action={
                    canCreate ? (
                        <ButtonDefault
                            data-testid="new-record-button"
                            onClick={() =>
                                history.push(
                                    `/cms/content-entries/${contentModel.modelId}?new=true`
                                )
                            }
                        >
                            <ButtonIcon icon={<AddIcon />} /> {t`New Entry`}
                        </ButtonDefault>
                    ) : null
                }
            />
        );
    }

    const props = {
        setLoading,
        getLoading,
        entry,
        revisions,
        refetchContent: getEntry.refetch,
        contentModel,
        state, // TODO: remove this crap!
        setState, // TODO: remove this crap!
        listQueryVariables
    };

    return (
        <DetailsContainer>
            <test-id data-testid="cms-content-details">
                <Tabs>
                    {({ switchTab }) => (
                        <Fragment>
                            <Tab label={"Content"} disabled={getLoading()}>
                                <RenderBlock>
                                    <Elevation z={2} className={elevationStyles}>
                                        {getLoading() && <CircularProgress />}
                                        <Header {...props} />
                                        <ContentForm {...props} />
                                        <Footer {...props} />
                                    </Elevation>
                                </RenderBlock>
                            </Tab>
                            <Tab label={"Revisions"} disabled={getLoading()}>
                                <RevisionsList {...props} switchTab={switchTab} />
                            </Tab>
                        </Fragment>
                    )}
                </Tabs>
            </test-id>
        </DetailsContainer>
    );
};

export default ContentDetails;
