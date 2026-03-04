# Client vs Server Separation (SmartTrip)

## Why separate client and server logic?

1. Security
- Secrets stay on server (`SUPABASE_SERVICE_ROLE_KEY`, provider keys).
- Browser gets only safe data.

2. Maintainability
- UI concerns stay in `client/`.
- API orchestration and data access stay in `server/`.

3. Testability
- Controllers and data-sources can be tested without rendering UI.

4. Reuse
- `shared/` holds types/constants/config used by both sides.

## What belongs where?

### `client/`
- Views (`client/views`): React UI rendering.
- Controllers (`client/controllers`): bind page route -> view.
- Components (`client/components`): reusable presentational blocks.
- Stores (`client/stores`): UI/client state (MobX, React state helpers).

### `server/`
- API routes (`server/api-routes`): HTTP endpoint mapping.
- Controllers (`server/controllers`): request orchestration/business flow.
- Data sources (`server/data-sources`): DB and downstream API calls.
- Plugins (`server/plugins`): request context, auth middleware, GraphQL plugin.
- GraphQL (`server/graphql`): schema/resolvers.
- Stores (`server/stores`): optional runtime in-memory server state.

### `shared/`
- Constants, shared types, config loader, helper utilities.

## Can stores exist on both client and server?

Yes.
- Client stores: UI state, optimistic updates, form state.
- Server stores: process-level metrics, cache metadata, non-persistent runtime flags.

## Parent component context sharing

Yes, React Context is good for UI state sharing in the client tree.
Examples:
- authenticated user info
- selected trip id for UI navigation
- theme and feature flags

But API security context still must be validated server-side.
Do not trust client context alone for authorization.
