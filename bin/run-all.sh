#!/bin/sh

# Colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Ship Nuxt (run-all.sh)...${NC}"

API_ENV_FILE="apps/api/.env"
API_ENV_EXAMPLE_FILE="apps/api/.env.example"

if [ ! -f "$API_ENV_FILE" ]; then
        echo "$API_ENV_FILE does not exist. Copying from $API_ENV_EXAMPLE_FILE..."
        cp "$API_ENV_EXAMPLE_FILE" "$API_ENV_FILE"
        echo "$API_ENV_FILE created from $API_ENV_EXAMPLE_FILE."
fi

# Start infrastructure
echo "⏳ Starting infrastructure (MySQL and Redis)..."
pnpm infra &
INFRA_PID=$!

# Wait for MySQL to be ready by checking if we can connect
echo -n "⏳ Waiting for MySQL to be ready"
until docker compose exec mysql mysqladmin ping --silent; do
    echo -n "."
    sleep 2
done

# Wait for Redis to be ready
echo -n "⏳ Waiting for Redis to be ready"
until docker compose exec redis redis-cli ping | grep -q PONG; do
    echo -n "."
    sleep 2
done

echo -e "\r${GREEN}✅ MySQL and Redis are ready!${NC}"

# Generate and run database migrations
echo -e "${GREEN}🗄️  Setting up database...${NC}"

echo "📝 Generating database migrations..."
if pnpm --filter api db:generate; then
    echo -e "${GREEN}✅ Migrations generated successfully${NC}"
else
    echo -e "\033[0;31m❌ Failed to generate migrations${NC}"
    cleanup
    exit 1
fi

echo "🚀 Running database migrations..."
if pnpm --filter api db:migrate; then
    echo -e "${GREEN}✅ Database migrations completed successfully${NC}"
else
    echo -e "\033[0;31m❌ Failed to run migrations${NC}"
    cleanup
    exit 1
fi
echo -e "${GREEN}✅ Database setup completed! Starting web and API servers...${NC}"

# Start the web and API servers
pnpm turbo-start &
TURBO_PID=$!

echo -e "\nInfrastructure PID: $INFRA_PID"
echo "Turbo PID: $TURBO_PID"
echo -e "${GREEN}✨ All services starting!${NC}"
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo -e "\n${GREEN}Stopping all services...${NC}"
    kill $TURBO_PID 2>/dev/null
    kill $INFRA_PID 2>/dev/null
    docker compose down
    exit 0
}

trap cleanup INT TERM

# Wait for turbo process
wait $TURBO_PID
