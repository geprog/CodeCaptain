#! /bin/sh

set -e

# apply migrations
node ./contrib/migrate.js

# start the server
overmind start