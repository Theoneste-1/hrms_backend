#!/bin/bash

SERVICES=("analytics-service"
"employee-service"
"payroll-service"
"time-service"
"performance-service"
"learning-service"
"recruitment-service"
"ml-service"
"billing-service"
"notification-service"
"document-service"
"integration-service"
"audit-service"
"workflow-service"
"api-gateway"
"service-directory"
"monitoring-service"
"config-service")

for SERVICE in "${SERVICES[@]}"; do
    echo "Generating service: $SERVICE"
    mkdir -p "$SERVICE/src"
    cd "$SERVICE"
    cp ../workflow-service/package.json .
    cp ../workflow-service/tsconfig.json .
    cp ../workflow-service/src/index.ts .
    cp ../auth-service/prisma/schema.prisma .
    cd ..
done