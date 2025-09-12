#!/usr/bin/env bash
set -e

echo "🔄 Setting up MySQL GTID-based replication..."

# Wait for master and slave to be ready
echo "⏳ Waiting for master to be ready..."
for i in $(seq 1 30); do
  if mysql -h$MASTER_HOST -P$MASTER_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Master ready"
    break
  fi
  echo "   Waiting for master... ($i/30)"
  sleep 2
done

echo "⏳ Waiting for slave to be ready..."
for i in $(seq 1 30); do
  if mysql -h$SLAVE_HOST -P$SLAVE_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "SELECT 1" > /dev/null 2>&1; then
    echo "✅ Slave ready"
    break
  fi
  echo "   Waiting for slave... ($i/30)"
  sleep 2
done

# Ensure GTID mode is enabled on both servers
echo "🔧 Verifying GTID configuration..."
MASTER_GTID_MODE=$(mysql -h$MASTER_HOST -P$MASTER_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "SELECT @@GLOBAL.gtid_mode;" | tail -1)
SLAVE_GTID_MODE=$(mysql -h$SLAVE_HOST -P$SLAVE_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "SELECT @@GLOBAL.gtid_mode;" | tail -1)

echo "Master GTID mode: $MASTER_GTID_MODE"
echo "Slave GTID mode: $SLAVE_GTID_MODE"

if [[ "$MASTER_GTID_MODE" != "ON" || "$SLAVE_GTID_MODE" != "ON" ]]; then
  echo "❌ GTID mode is not enabled on both servers"
  exit 1
fi

# Create replication user on master
echo "👤 Creating replication user on master..."
mysql -h$MASTER_HOST -P$MASTER_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "
  CREATE USER IF NOT EXISTS 'replicator'@'%' IDENTIFIED BY 'replicator_pass';
  GRANT REPLICATION SLAVE ON *.* TO 'replicator'@'%';
  FLUSH PRIVILEGES;
"

# Stop any existing replication on slave
echo "🛑 Stopping any existing replication..."
mysql -h$SLAVE_HOST -P$SLAVE_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "STOP SLAVE;" || true

# Reset slave completely for clean GTID setup
echo "🧹 Resetting slave for clean GTID setup..."
mysql -h$SLAVE_HOST -P$SLAVE_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "
  RESET SLAVE ALL;
  RESET MASTER;
"

# Get current GTID state from master
echo "📊 Getting master GTID state..."
MASTER_GTID_EXECUTED=$(mysql -h$MASTER_HOST -P$MASTER_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "SELECT @@GLOBAL.gtid_executed;" | tail -1)
echo "Master GTID executed: '$MASTER_GTID_EXECUTED'"

# Set slave's GTID_PURGED to match master's executed GTIDs (if any)
if [[ -n "$MASTER_GTID_EXECUTED" && "$MASTER_GTID_EXECUTED" != "" ]]; then
  echo "🔄 Setting slave GTID_PURGED to match master..."
  mysql -h$SLAVE_HOST -P$SLAVE_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "
    SET GLOBAL gtid_purged='$MASTER_GTID_EXECUTED';
  "
else
  echo "ℹ️ Master has no executed GTIDs, starting fresh"
fi

# Configure slave with GTID auto-positioning
echo "⚙️ Configuring slave with GTID auto-positioning..."
mysql -h$SLAVE_HOST -P$SLAVE_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "
  CHANGE MASTER TO 
    MASTER_HOST='$MASTER_HOST',
    MASTER_PORT=$MASTER_PORT,
    MASTER_USER='replicator',
    MASTER_PASSWORD='replicator_pass',
    MASTER_AUTO_POSITION=1;
"

# Start slave
echo "▶️ Starting slave replication..."
mysql -h$SLAVE_HOST -P$SLAVE_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "START SLAVE;"

# Wait for slave to start
echo "⏳ Waiting for slave to start..."
sleep 5

# Verify replication status
echo "🔍 Verifying replication status..."
SLAVE_STATUS=$(mysql -h$SLAVE_HOST -P$SLAVE_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "SHOW SLAVE STATUS\G")
IO_RUNNING=$(echo "$SLAVE_STATUS" | grep "Slave_IO_Running:" | awk '{print $2}')
SQL_RUNNING=$(echo "$SLAVE_STATUS" | grep "Slave_SQL_Running:" | awk '{print $2}')
LAST_ERRNO=$(echo "$SLAVE_STATUS" | grep "Last_Errno:" | awk '{print $2}')
SECONDS_BEHIND=$(echo "$SLAVE_STATUS" | grep "Seconds_Behind_Master:" | awk '{print $2}')

echo "Slave_IO_Running: $IO_RUNNING"
echo "Slave_SQL_Running: $SQL_RUNNING"
echo "Last_Errno: $LAST_ERRNO"
echo "Seconds_Behind_Master: $SECONDS_BEHIND"

if [[ "$IO_RUNNING" == "Yes" && "$SQL_RUNNING" == "Yes" && "$LAST_ERRNO" == "0" ]]; then
  echo "✅ GTID replication is working properly"
  
  # Test replication with actual data
  echo "🧪 Testing GTID replication..."
  
  # Create test database and table on master
  mysql -h$MASTER_HOST -P$MASTER_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "
    CREATE DATABASE IF NOT EXISTS gtid_replication_test;
    USE gtid_replication_test;
    CREATE TABLE IF NOT EXISTS test_table (
      id INT AUTO_INCREMENT PRIMARY KEY,
      message VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    INSERT INTO test_table (message) VALUES ('GTID replication test');
  "
  
  # Wait for replication
  echo "⏳ Waiting for replication to complete..."
  sleep 5
  
  # Check if data replicated to slave
  REPLICATED_COUNT=$(mysql -h$SLAVE_HOST -P$SLAVE_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "
    USE gtid_replication_test;
    SELECT COUNT(*) as count FROM test_table;
  " | tail -1)
  
  if [[ "$REPLICATED_COUNT" -gt 0 ]]; then
    echo "✅ GTID replication test successful - data replicated from master to slave"
    
    # Get GTID positions for verification
    MASTER_GTID_EXECUTED_AFTER=$(mysql -h$MASTER_HOST -P$MASTER_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "SELECT @@GLOBAL.gtid_executed;" | tail -1)
    SLAVE_GTID_EXECUTED=$(mysql -h$SLAVE_HOST -P$SLAVE_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "SELECT @@GLOBAL.gtid_executed;" | tail -1)
    
    echo "📊 GTID Status:"
    echo "   Master executed: $MASTER_GTID_EXECUTED_AFTER"
    echo "   Slave executed:  $SLAVE_GTID_EXECUTED"
    
    # Clean up test data
    mysql -h$MASTER_HOST -P$MASTER_PORT -uroot -p$MYSQL_ROOT_PASSWORD -e "DROP DATABASE gtid_replication_test;"
    
    echo "🎉 GTID-based MySQL replication is fully configured and working!"
  else
    echo "❌ GTID replication test failed - data not replicated"
    echo "Slave status details:"
    echo "$SLAVE_STATUS"
    exit 1
  fi
  
else
  echo "❌ GTID replication is not working properly"
  echo "Expected: IO_Running=Yes, SQL_Running=Yes, Last_Errno=0"
  echo "Actual: IO_Running=$IO_RUNNING, SQL_Running=$SQL_RUNNING, Last_Errno=$LAST_ERRNO"
  if [[ "$LAST_ERRNO" != "0" ]]; then
    LAST_ERROR=$(echo "$SLAVE_STATUS" | grep "Last_Error:" | cut -d: -f2- | xargs)
    echo "Last Error: $LAST_ERROR"
  fi
  echo "Full slave status:"
  echo "$SLAVE_STATUS"
  exit 1
fi

echo "✅ GTID replication setup completed successfully"

# Keep container running if IMMORTAL is set (for debugging)
[[ $IMMORTAL ]] && while true; do sleep 60; done

exit 0