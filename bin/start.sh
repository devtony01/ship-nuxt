#!/bin/sh

API_ENV_FILE="apps/api/.env"
API_ENV_EXAMPLE_FILE="apps/api/.env.example"

if [ ! -f "$API_ENV_FILE" ]; then
    echo "$API_ENV_FILE does not exist. Copying from $API_ENV_EXAMPLE_FILE..."
    cp "$API_ENV_EXAMPLE_FILE" "$API_ENV_FILE"
    echo "$API_ENV_FILE created from $API_ENV_EXAMPLE_FILE."
fi

export DOCKER_CLIENT_TIMEOUT=600
export COMPOSE_HTTP_TIMEOUT=600

echo 'You can start services independently'
echo './bin/start.sh api scheduler web mailer'

docker compose up --build "$@"