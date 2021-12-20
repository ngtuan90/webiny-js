import { createWorkflowMethods } from "./createWorkflowMethods";
import { createReviewerMethods } from "./createReviewerMethods";
import { createCommentMethods } from "./createCommentMethods";
import { createChangeRequestMethods } from "./createChangeRequestMethods";
import { createContentReviewMethods } from "./createContentReviewMethods";
import { AdvancedPublishingWorkflow, CreateApwParams } from "~/types";

export const createAdvancedPublishingWorkflow = (
    params: CreateApwParams
): AdvancedPublishingWorkflow => {
    const workflowMethods = createWorkflowMethods(params);
    const reviewerMethods = createReviewerMethods(params);
    const changeRequestMethods = createChangeRequestMethods(params);

    return {
        workflow: workflowMethods,
        reviewer: reviewerMethods,
        changeRequest: changeRequestMethods,
        comment: createCommentMethods({
            ...params,
            getChangeRequestModel: changeRequestMethods.getModel
        }),
        contentReview: createContentReviewMethods({
            ...params,
            getReviewer: reviewerMethods.get.bind(reviewerMethods)
        })
    };
};
