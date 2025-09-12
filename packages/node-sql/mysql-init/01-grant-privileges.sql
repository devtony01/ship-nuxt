-- Grant additional privileges to testuser for replication monitoring
GRANT REPLICATION CLIENT ON *.* TO 'testuser'@'%';
GRANT SUPER ON *.* TO 'testuser'@'%';
FLUSH PRIVILEGES;