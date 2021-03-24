import React, { useCallback } from "react";
import dotProp from "dot-prop-immutable";
import { i18n } from "@webiny/app/i18n";
import { Form } from "@webiny/form";
import { Grid, Cell } from "@webiny/ui/Grid";
import { Input } from "@webiny/ui/Input";
import { ButtonPrimary } from "@webiny/ui/Button";
import { CircularProgress } from "@webiny/ui/Progress";
import { Switch } from "@webiny/ui/Switch";
import { validation } from "@webiny/validation";
import {
    SimpleForm,
    SimpleFormFooter,
    SimpleFormContent,
    SimpleFormHeader
} from "@webiny/app-admin/components/SimpleForm";
import { useRouter } from "@webiny/react-router";
import { useSnackbar } from "@webiny/app-admin/hooks/useSnackbar";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { CREATE_CAR_MANUFACTURER, READ_CAR_MANUFACTURER, UPDATE_CAR_MANUFACTURER } from "./graphql";
import EmptyView from "@webiny/app-admin/components/EmptyView";
import { ButtonDefault, ButtonIcon } from "@webiny/ui/Button";
import { ReactComponent as AddIcon } from "@webiny/app-admin/assets/icons/add-18px.svg";
import { CarManufacturerItem, CarManufacturerItemUserFields } from "../types";
import { addToListCache, updateToListCache } from "./cache";

const t = i18n.ns("admin-app-carManufacturer/form");

const pickCarManufacturerData = (item: CarManufacturerItem): CarManufacturerItemUserFields => {
    return {
        title: item.title,
        description: item.description,
        isNice: item.isNice
    };
};

interface Props {
    limit: number;
    sortBy: string;
}

const CarManufacturerForm: React.FunctionComponent<Props> = ({ limit, sortBy }) => {
    const { location, history } = useRouter();
    const { showSnackbar } = useSnackbar();
    const searchParams = new URLSearchParams(location.search);
    const newCarManufacturer = searchParams.get("new") === "true";
    const id = searchParams.get("id");

    const getQuery = useQuery(READ_CAR_MANUFACTURER, {
        variables: { id },
        skip: !id,
        onCompleted: data => {
            const error = dotProp.get(data, "carManufacturers.getCarManufacturer.data.error", null);
            if (!error) {
                return;
            }

            history.push("/carManufacturers");
            showSnackbar(error.message || "Unspecified error.");
        }
    });

    const [createCarManufacturer, createMutation] = useMutation(CREATE_CAR_MANUFACTURER);
    const [updateCarManufacturer, updateMutation] = useMutation(UPDATE_CAR_MANUFACTURER);

    const onSubmit = useCallback(
        async (formData: CarManufacturerItem) => {
            const isUpdate = !!formData.createdOn;
            const data = pickCarManufacturerData(formData);
            const listVariables = {
                sort: [sortBy],
                limit
            };
            if (isUpdate) {
                await updateCarManufacturer({
                    variables: {
                        id: formData.id,
                        data: data
                    },
                    update: (cache, response) => {
                        const updateCarManufacturerResponse = dotProp.get(
                            response,
                            "data.carManufacturers.updateCarManufacturer",
                            null
                        );
                        if (!updateCarManufacturerResponse) {
                            return showSnackbar(
                                t`There is no "data.carManufacturers.updateCarManufacturer" in the response.`
                            );
                        }
                        const { data: carManufacturer, error } = updateCarManufacturerResponse;
                        if (error) {
                            return showSnackbar(error.message);
                        } else if (!carManufacturer) {
                            return showSnackbar(t`There is no CarManufacturer data in the response.`);
                        }
                        updateToListCache(cache, listVariables, carManufacturer);

                        showSnackbar(t`CarManufacturer saved successfully.`);
                    }
                });
                return;
            }
            await createCarManufacturer({
                variables: {
                    data: data
                },
                update: (cache, response) => {
                    const createCarManufacturerResponse = dotProp.get(
                        response,
                        "data.carManufacturers.createCarManufacturer",
                        null
                    );
                    if (!createCarManufacturerResponse) {
                        return showSnackbar(
                            t`There is no "data.carManufacturers.createCarManufacturer" in the response.`
                        );
                    }
                    const { data: carManufacturer, error } = createCarManufacturerResponse;
                    if (error) {
                        return showSnackbar(error.message);
                    } else if (!carManufacturer) {
                        return showSnackbar(t`There is no CarManufacturer data in the response.`);
                    }
                    addToListCache(cache, listVariables, carManufacturer);

                    history.push(`/carManufacturers/?id=${encodeURIComponent(carManufacturer.id)}`);

                    showSnackbar(t`CarManufacturer saved successfully.`);
                }
            });
        },
        [id]
    );

    const loading = [getQuery, createMutation, updateMutation].some(item => !!item.loading);

    const carManufacturerData = dotProp.get(getQuery, "data.carManufacturers.getCarManufacturer.data", null);

    const showEmptyView = !newCarManufacturer && !loading && !carManufacturerData;
    // Render "No content" selected view.
    if (showEmptyView) {
        return (
            <EmptyView
                title={t`Click on the left side list to display carManufacturer details or create a...`}
                action={
                    <ButtonDefault
                        data-testid="new-carManufacturer-button"
                        onClick={() => history.push("/carManufacturers?new=true")}
                    >
                        <ButtonIcon icon={<AddIcon />} /> {t`New CarManufacturer`}
                    </ButtonDefault>
                }
            />
        );
    }
    const data = carManufacturerData || {};
    return (
        <Form data={data} onSubmit={onSubmit}>
            {({ data, form, Bind }) => (
                <SimpleForm>
                    {loading && <CircularProgress />}
                    <SimpleFormHeader title={data.title || "Untitled"} />
                    <SimpleFormContent>
                        <Grid>
                            <Cell span={12}>
                                <Bind name="title" validators={validation.create("required")}>
                                    <Input label={"Title"} />
                                </Bind>
                            </Cell>
                            <Cell span={12}>
                                <Bind
                                    name="description"
                                    validators={validation.create("maxLength:500")}
                                >
                                    <Input
                                        label={"Description"}
                                        description={"Provide a short description here."}
                                        rows={4}
                                    />
                                </Bind>
                            </Cell>
                            <Cell span={12}>
                                <Bind name="isNice">
                                    <Switch
                                        label={"A nice carManufacturer"}
                                        description={
                                            "Check if the carManufacturer is considered to be nice."
                                        }
                                    />
                                </Bind>
                            </Cell>
                        </Grid>
                    </SimpleFormContent>
                    <SimpleFormFooter>
                        <ButtonPrimary onClick={form.submit}>{t`Save carManufacturer`}</ButtonPrimary>
                    </SimpleFormFooter>
                </SimpleForm>
            )}
        </Form>
    );
};

export default CarManufacturerForm;
