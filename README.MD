## Onga
##### A web application for listening and organizing music files

### Running
Build and run according to the docker-compose.yml on top level.
secrets.ts file should be added to back/src with the following content:
```typescript
export const JWT_SECRET = "secret_token_here"
```
For development, `ng serve` and `back/docker-compose.yml` can be used instead.