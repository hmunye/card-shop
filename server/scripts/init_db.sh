#!/usr/bin/env bash

# set -x
set -eo pipefail 

if ! [ -x "$(command -v docker)" ]; then
    echo >&2 "error: docker is not installed"
    exit 1
fi

if [[ -f ".env" ]]; then
  source .env
else
  echo >&2 "error: .env file not found in the current directory"
  exit 1
fi

PGUSER=$DB_USER
PGPASSWORD=$DB_PASSWORD
PGDATABASE=$DB_NAME
PGHOST=$DB_HOST

SUPERUSER=postgres
SUPERUSER_PWD=password

# Fixed container name
CONTAINER_NAME=card-shop-db

RUNNING_POSTGRES_CONTAINER=$(docker ps --filter 'name=card-shop-db' --format '{{.ID}}')

# If a Postgres container is running, output instructions to kill it and exit
if [[ -n $RUNNING_POSTGRES_CONTAINER ]]; then
    echo >&2 "Postgres container already running, kill it with"
    echo >&2 "    docker kill ${RUNNING_POSTGRES_CONTAINER}"
    exit 1
fi

docker run \
    --volume "./scripts/:/scripts/" \
    --env POSTGRES_USER=${SUPERUSER} \
    --env POSTGRES_PASSWORD=${SUPERUSER_PWD} \
    --health-cmd="pg_isready -U ${SUPERUSER} || exit 1" \
    --health-interval=1s \
    --health-timeout=5s \
    --health-retries=5 \
    --publish 5432:5432 \
    --detach \
    --name "${CONTAINER_NAME}" \
    postgres:alpine -N 1000 > /dev/null

until [ \
    "$(docker inspect -f "{{.State.Health.Status}}" ${CONTAINER_NAME})" == \
    "healthy" \
]; do     
    >&2 echo "Postgres is still unavailable - sleeping..."
    sleep 1 
done

CREATE_QUERY="CREATE USER ${PGUSER} WITH ENCRYPTED PASSWORD '${PGPASSWORD}';"
docker exec "${CONTAINER_NAME}" psql -U "${SUPERUSER}" -c "${CREATE_QUERY}"

echo "postgres is up on ${PGHOST}:5432 - ready for connections..."

CREATE_DB_QUERY="CREATE DATABASE ${PGDATABASE};"
docker exec "${CONTAINER_NAME}" psql -U "${SUPERUSER}" -c "${CREATE_DB_QUERY}"

GRANT_SCHEMA_QUERY="GRANT ALL PRIVILEGES ON SCHEMA public TO ${PGUSER};"
docker exec "${CONTAINER_NAME}" psql -U "${SUPERUSER}" -d "${PGDATABASE}" -c "${GRANT_SCHEMA_QUERY}"

GRANT_CREATE_PRIVILEGES_QUERY="GRANT CREATE ON DATABASE ${PGDATABASE} TO ${PGUSER};"
docker exec "${CONTAINER_NAME}" psql -U "${SUPERUSER}" -d "${PGDATABASE}" -c "${GRANT_CREATE_PRIVILEGES_QUERY}"

echo "database '${PGDATABASE}' created successfully - inserting tables..."

docker exec "${CONTAINER_NAME}" psql -h "${PGHOST}" -U "${PGUSER}" -d "${PGDATABASE}" -f "./scripts/schema.sql"
echo "tables inserted successfully for database: '${PGDATABASE}'"
