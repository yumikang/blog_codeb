#!/bin/bash

# Supabase project ref
PROJECT_REF="taxztmphioixwsxsveko"

# Function to execute SQL via Supabase Management API
execute_sql() {
    local sql_file=$1
    local sql_content=$(cat "$sql_file")
    
    echo "Executing: $sql_file"
    
    curl -X POST "https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
        -d "{\"query\": $(echo "$sql_content" | jq -Rs .)}"
}

# Execute migrations
echo "1. Dropping existing tables..."
execute_sql "drop_all_tables.sql"

echo -e "\n2. Running complete migration..."
execute_sql "complete_migration.sql"

echo -e "\nMigration complete!"