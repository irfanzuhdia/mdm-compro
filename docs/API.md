# API Documentation

## Contract
OpenAPI 3.1 YAML is stored at:

```bash
docs/openapi.yaml
```

Copy it into the backend docs folder with:

```bash
make openapi
```

## Run API Locally

```bash
docker compose up --build api postgres
```

Health check:

```bash
curl http://localhost:8080/healthz
```

Public navigation:

```bash
curl http://localhost:8080/api/v1/public/navigation
```

Public CMS page by path:

```bash
curl http://localhost:8080/api/v1/public/pages/company/history
```

Login:

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@multidayamitra.co.id","password":"admin123"}'
```

Protected dashboard:

```bash
TOKEN="<accessToken>"
curl http://localhost:8080/api/v1/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

## Swagger UI
Run a temporary Swagger UI container:

```bash
docker run --rm -p 8081:8080 \
  -e SWAGGER_JSON=/openapi.yaml \
  -v "$PWD/docs/openapi.yaml:/openapi.yaml:ro" \
  swaggerapi/swagger-ui
```

Open `http://localhost:8081`.

## Error Format

```json
{
  "error": "validation_error",
  "message": "Request validation failed.",
  "fields": {
    "email": "A valid email is required."
  }
}
```
