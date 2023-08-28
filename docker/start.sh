#! /bin/sh

set -e

ls -la /app
ls -la /app/data
ls -la /app/contrib

# apply migrations
node ./contrib/migrate.js

# start the server
overmind start