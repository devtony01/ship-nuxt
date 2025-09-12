#!/bin/sh

# Simple test runner following @paralect/node-mongo pattern
# Use modern docker compose instead of legacy docker-compose
case "$1" in
  "replication")
    echo "🔄 Running replication tests..."
    docker compose -f docker-compose.tests.yml --profile replication up --build tests-replication
    ;;
  *)
    echo "🧪 Running basic tests..."
    docker compose -f docker-compose.tests.yml up --build tests
    ;;
esac