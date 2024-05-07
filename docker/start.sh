#!/bin/sh

export PERSISTENCE_DATA_PATH=/app/vectorstore
export QUERY_DEFAULTS_LIMIT=25
export AUTHENTICATION_ANONYMOUS_ACCESS_ENABLED='true'
export ENABLE_MODULES=''
export DEFAULT_VECTORIZER_MODULE='none'
export CLUSTER_HOSTNAME='node1'

echo "Starting app and vectorstore ..."
node .output/server/index.mjs --port 3000 --host 0.0.0.0 &
weaviate --port 8080 --host 0.0.0.0 --scheme http &

wait %1
wait %2

echo "done"
