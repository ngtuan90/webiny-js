import get from "lodash/get";
import set from "lodash/set";
import { CmsContext, CmsModelFieldToGraphQLCreateResolver } from "~/types";
import { entryFieldFromStorageTransform } from "~/content/plugins/utils/entryStorage";

/**
 * We use a factory to avoid passing the parameters for recursive invocations.
 * This way they will always be in the function scope and we can only pass "fields".
 */
export function createFieldResolversFactory({ endpointType, models, model, fieldTypePlugins }) {
    return function createFieldResolvers({ graphQLType, fields, extraFields = {} }) {
        const fieldResolvers = { ...extraFields };
        const typeResolvers = {};

        for (const field of fields) {
            if (!fieldTypePlugins[field.type]) {
                continue;
            }

            const createResolver: CmsModelFieldToGraphQLCreateResolver = get(
                fieldTypePlugins,
                `${field.type}.${endpointType}.createResolver`
            );

            let resolver;
            const fieldResolver = createResolver
                ? createResolver({ graphQLType, models, model, field, createFieldResolvers })
                : null;

            if (typeof fieldResolver === "function") {
                resolver = fieldResolver;
            } else if (fieldResolver !== null) {
                resolver = fieldResolver.resolver;
                Object.assign(typeResolvers, fieldResolver.typeResolvers);
            }

            fieldResolvers[field.fieldId] = async (
                parent, // entry.values
                args,
                context: CmsContext,
                info
            ) => {
                // Get transformed value (eg. data decompression)
                const transformedValue = await entryFieldFromStorageTransform({
                    context,
                    model,
                    entry: parent,
                    field,
                    value: parent.values[field.fieldId]
                });

                const entry = set(parent, `values.${field.fieldId}`, transformedValue);

                if (!resolver) {
                    return entry.values[field.fieldId];
                }

                /**
                 * We need to pass the entire entry, but also isolated "parent" value (for nested objects).
                 */
                return await resolver({ entry, parent: entry.values, args, context, info, field });
            };
        }

        return { [graphQLType]: fieldResolvers, ...typeResolvers };
    };
}
