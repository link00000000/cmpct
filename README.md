# cmpct

A URL shrtnr

## Requirements ✨

-   yarn
-   redis
-   openssl

It is assumed there is already a redis server running on localhost

## Development 💻

```shell
# Install dependencies
yarn
cd client && yarn && cd ..

# Generate self-signed SSL certificates
yarn ssl-gencerts

# Start development servers
yarn dev
```

## Production 📦

```shell
# Install dependencies
yarn
cd client && yarn && cd ..

# Build and start production server
yarn start
```

## Useful Scripts ⚙

-   `yarn lint` - Lint your code and automatically apply formatting fixes
-   `yarn ssl-gencerts` - Generate SSL certificates using openssl in certs/
-   `yarn dev` - Start both development servers
-   `yarn build` - Build project for production. Compiled code in build/ and client/build/
-   `yarn redis:start` - Start redis server using Docker
-   `yarn redis:attach` - Attach to current running instance of redis
-   `yarn clean` - Remove temporary files
