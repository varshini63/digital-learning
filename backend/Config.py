import os

class Config:
    # Oracle DB Configuration
    ORACLE_USER = os.getenv('ORACLE_USER', 'system')  # Replace with your Oracle username
    ORACLE_PASSWORD = os.getenv('ORACLE_PASSWORD', 'system')  # Replace with your Oracle password
    ORACLE_HOST = os.getenv('ORACLE_HOST', 'localhost')  # Replace with your Oracle host
    ORACLE_PORT = os.getenv('ORACLE_PORT', 1521)  # Default Oracle port is 1521
    ORACLE_SERVICE_NAME = os.getenv('ORACLE_SERVICE_NAME', 'XE')  # Replace with your Oracle service name
