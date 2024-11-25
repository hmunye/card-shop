<?php

namespace API\Middleware;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface;

class CorsMiddleware
{
    public function __invoke(Request $request, RequestHandlerInterface $handler): Response
    {
        if ($request->getMethod() === 'OPTIONS') {
            return $this->handleOptionsRequest($request);
        }

        $response = $handler->handle($request);

        $response = $response->withHeader('Access-Control-Allow-Origin', 'http://localhost:3030')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            ->withHeader('Access-Control-Allow-Credentials', 'true');

        $body = $response->getBody();
        $contentLength = strlen((string) $body);
        if ($contentLength > 0) {
            $response = $response->withHeader('Content-Length', (string) $contentLength);
        }

        return $response;
    }

    private function handleOptionsRequest(Request $request): Response
    {
        return (new \Slim\Psr7\Response())
            ->withHeader('Access-Control-Allow-Origin', 'http://localhost:3030')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withStatus(200);
    }
}
