import { GraphQLClient } from "graphql-request";

const MORPHO_GRAPHQL_ENDPOINT = "https://blue-api.morpho.org/graphql";

export const morphoApiClient = new GraphQLClient(MORPHO_GRAPHQL_ENDPOINT);
