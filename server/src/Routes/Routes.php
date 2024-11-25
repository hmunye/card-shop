<?php

use Slim\App;
use API\Controllers\AuthController;
use API\Controllers\CommerceController;
use API\Middleware\JwtMiddleware;
use API\Config\Database;

return function (App $app) {
    $secretKey = $_ENV['JWT_SECRET_KEY'];

    $database = new Database();
    $dbConnection = $database->connect();

    if (!$dbConnection) {
        throw new Exception('Failed to connect to the database');
    }

    $authController = new AuthController($dbConnection, $secretKey);
    $commerceController = new CommerceController($dbConnection);

    $app->post('/api/auth/signup', [$authController, 'signup']);
    $app->post('/api/auth/login', [$authController, 'login']);
    $app->post('/api/auth/logout', [$authController, 'logout'])->add(new JwtMiddleware($secretKey));
    $app->get('/api/auth/check', [$authController, 'checkToken'])->add(new JwtMiddleware($secretKey));

    $app->post('/api/cards', [$commerceController, 'createCardListing'])->add(new JwtMiddleware($secretKey));
    $app->get('/api/cards', [$commerceController, 'getAllCards']);
    $app->delete('/api/cards/{cardId}', [$commerceController, 'removeCardListing'])->add(new JwtMiddleware($secretKey));
    $app->post('/api/cards/{cardId}', [$commerceController, 'relistCard'])->add(new JwtMiddleware($secretKey));
    $app->patch('/api/cards/{cardId}', [$commerceController, 'sellCard'])->add(new JwtMiddleware($secretKey));
    $app->delete('/api/orders/{orderId}', [$commerceController, 'cancelOrder'])->add(new JwtMiddleware($secretKey));
    $app->get('/api/users/cards', [$commerceController, 'getCardListing'])->add(new JwtMiddleware($secretKey));
    $app->get('/api/users/transactions', [$commerceController, 'getUserTransactions'])->add(new JwtMiddleware($secretKey));
    $app->get('/api/users/orders', [$commerceController, 'getUserOrders'])->add(new JwtMiddleware($secretKey));
};
