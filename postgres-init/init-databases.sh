#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE DATABASE employee_service_db;
    CREATE DATABASE learning_service_db;
    CREATE DATABASE performance_service_db;
    CREATE DATABASE payroll_service_db;
    CREATE DATABASE auth_service_db;  # Adjust if name is user_service_db
    CREATE DATABASE time_record_service_db;
EOSQL