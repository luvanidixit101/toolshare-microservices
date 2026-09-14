# Production deployment

ToolShare includes a production-oriented Compose baseline in `docker-compose.prod.yml`.
It exposes only the frontend container; Nginx serves the SPA and proxies `/api` to the
internal API gateway. PostgreSQL, Eureka, and application service ports stay on the
private Compose network.

## Required configuration

Copy `.env.example` to a deployment secret store or an untracked `.env` file and set:

- strong, unique `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `JWT_SECRET` values;
- `GOOGLE_CLIENT_ID` for the deployed public origin;
- `GEMINI_API_KEY`;
- `PUBLIC_ORIGIN`, including the `https://` scheme and public hostname;
- optionally `HTTP_PORT` for the local listener behind your TLS load balancer.

Never enable `MOCK_PAYMENTS_ENABLED` or `VITE_USE_MOCK` in production. Online checkout
currently fails closed until a real payment provider is integrated; the application
will not claim that a simulated payment succeeded.

## Build and start

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

Terminate TLS at a managed load balancer or reverse proxy in front of the configured
HTTP port. Back up the named PostgreSQL volume using encrypted storage and test restore
procedures before accepting customer data.

## Release checks

Run these for every release:

```bash
mvn -f backend/pom.xml test
npm --prefix frontend ci
npm --prefix frontend run lint
npm --prefix frontend run typecheck
npm --prefix frontend run build
docker compose -f docker-compose.prod.yml config --quiet
```

The current services still use Hibernate `ddl-auto: update`. Before the first production
release with persistent customer data, replace it with versioned Flyway or Liquibase
migrations and use `ddl-auto: validate`. A real payment provider, signed webhook handling,
refunds, payouts, reconciliation, and refresh-token revocation also require implementation
before paid rentals can be enabled.
