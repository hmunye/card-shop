<?php

namespace API\Config;

use PDO;
use PDOException;

class Database
{
    private string $host;
    private string $dbName;
    private string $user;
    private string $password;
    private string $port;
    private ?PDO $connection = null;

    public function __construct()
    {
        $this->host = $_ENV['DB_HOST'] ?? throw new PDOException('Database host is not configured');
        $this->dbName = $_ENV['DB_NAME'] ?? throw new PDOException('Database name is not configured');
        $this->user = $_ENV['DB_USER'] ?? throw new PDOException('Database user is not configured');
        $this->password = $_ENV['DB_PASSWORD'] ?? throw new PDOException('Database password is not configured');
        $this->port = $_ENV['DB_PORT'] ?? throw new PDOException('Database port is not configured');
    }

    public function connect()
    {
        try {
            $dsn = "pgsql:host={$this->host};port={$this->port};dbname={$this->dbName};";

            $this->connection = new PDO($dsn, $this->user, $this->password);

            $this->connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            return $this->connection;
        } catch (PDOException $e) {
            echo "Connection error: " . $e->getMessage();
            return null;
        }
    }
}
