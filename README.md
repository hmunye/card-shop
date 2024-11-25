# Card Shop

## Usage

### 1. **Prerequisites**

Before starting, ensure the following tools are installed:

- **Docker**: Install Docker by following the instructions on [Get Docker](https://docs.docker.com/get-started/get-docker/).
- **Node.js**: Install Node.js by following instructions on [Install Node](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs/).
- **PHP**: Install PHP by following instructions on [PHP Installation](https://www.php.net/manual/en/install.php).
- **Composer**: Install Composer (PHP Dependency Manager) by following instructions on [Composer Installation](https://getcomposer.org/download/).

### 2. **Clone the Repository**

Run the following command to clone the repository:

```bash
git clone https://github.com/hmunye/card-shop.git
```

### 3. **Running the Client/Server**

#### Step 1: Setup Client

Navigate to the client directory and install dependencies:

```bash
cd card-shop/client
```

Then, run the following command to install the necessary Node.js packages:

```bash
npm install
```

To run the client in development mode, use:

```bash
npm run dev
```

#### Step 2: Setup Server

Navigate to the server directory and install PHP dependencies:

```bash
cd ../server
```

Install the dependencies using Composer:

```bash
composer install
```

Create the `.env` file and update it with your configuration settings:

```bash
cp .env.example .env
```

Example `.env` configuration:

```bash
DB_HOST=localhost
DB_NAME=card_shop_db
DB_USER=admin
DB_PASSWORD=password
DB_PORT=5432
JWT_SECRET_KEY=your-secret-key-here
```

Setup Docker Postgres DB instance with test data:

```bash
./scripts/init_db.sh
```

Finally, start the PHP server:

```bash
php -S localhost:8080 -t public
```

To access the PostgreSQL Docker container, enter the following commmand:

```bash
docker exec -it card-shop-db /bin/bash
```

To access the database within Docker Container, enter the following command:

```bash
psql -U admin -d card_shop_db
```
