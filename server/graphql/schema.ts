import { buildSchema, graphql } from "graphql";
import * as supabaseDs from "@/server/data-sources/supabase-data-source";

const schema = buildSchema(`
  type Trip {
    id: ID!
    title: String!
    city: String!
    start_date: String
    user_id: String!
    created_at: String!
    updated_at: String!
  }

  input CreateTripInput {
    title: String!
    city: String!
    startDate: String
  }

  type Query {
    ping: String!
    trips: [Trip!]!
  }

  type Mutation {
    createTrip(input: CreateTripInput!): Trip
  }
`);

const root = {
  ping: () => "pong",
  trips: async (_: unknown, context: { app?: { context?: { userId?: string | null } } }) => {
    const userId = context.app?.context?.userId;
    if (!userId) {
      throw new Error("Missing x-user-id header.");
    }
    return supabaseDs.listTripsByUser(userId);
  },
  createTrip: async (
    { input }: { input: { title: string; city: string; startDate?: string } },
    context: { app?: { context?: { userId?: string | null } } }
  ) => {
    const userId = context.app?.context?.userId;
    if (!userId) {
      throw new Error("Missing x-user-id header.");
    }

    return supabaseDs.createTrip({
      userId,
      title: input.title,
      city: input.city,
      startDate: input.startDate ?? null
    });
  }
};

export async function executeGraphqlQuery(args: {
  source: string;
  variableValues?: Record<string, unknown>;
  contextValue: unknown;
}) {
  return graphql({
    schema,
    source: args.source,
    rootValue: root,
    variableValues: args.variableValues,
    contextValue: args.contextValue
  });
}
