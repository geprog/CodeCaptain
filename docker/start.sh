#! /bin/sh

set -e

ls -la /app
ls -la /app/contrib

# apply migrations
export MIGRATIONS_PATH=./contrib/migrations
node ./contrib/migrate.js

# start the server
overmind start