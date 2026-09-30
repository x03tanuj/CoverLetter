# CoverCraft AI

## Local development with Docker

The default local setup uses MongoDB 7 and a deterministic sample cover-letter
generator. It does not require a Groq API key.

Start the complete stack:

```bash
docker compose up --build
```

Open the client at <http://localhost:5471>. The API health endpoint is
<http://localhost:4000/health>, and MongoDB is available at
`mongodb://localhost:27017/coverletter`.

On a VPS, create a `.env` file next to `docker-compose.yml` and set
`PUBLIC_HOST` to the VPS public IP or domain before starting Compose:

```env
PUBLIC_HOST=54.146.223.117
```

Stop the stack:

```bash
docker compose down
```

The `mongo_data` volume preserves local data between restarts. Remove it only
when you want a fresh database:

```bash
docker compose down -v
```

## Running images individually

Start MongoDB first, then run the server and client images:

```bash
docker run -d --name coverletter-mongo -p 27017:27017 mongo:7
docker run --rm -p 4000:4000 \
  -e MONGO_URI=mongodb://host.docker.internal:27017/coverletter \
  -e JWT_SECRET=local-development-secret \
  -e LLM_PROVIDER=mock \
  coverletter-server
docker run --rm -p 5471:3000 coverletter-client
```

Build the images from the repository root:

```bash
docker build -t coverletter-server ./server
docker build --build-arg VITE_API_URL=http://localhost:4000 \
  -t coverletter-client ./client
```

## Optional Groq generation

Set `LLM_PROVIDER=groq` and provide `GROQ_API_KEY` only when real LLM
generation is needed. Keep credentials in an ignored local `.env` file or in
your deployment secret manager; never commit them.
