<?php

use Slim\Factory\AppFactory;
use API\Middleware\CorsMiddleware;

require __DIR__ . '/../vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();


$app = AppFactory::create();

$app->add(new CorsMiddleware());

$app->addErrorMiddleware(
    displayErrorDetails: false,
    logErrors: true,
    logErrorDetails: true
);

(require __DIR__ . '/../src/Routes/Routes.php')($app);

$app->run();
