<?php

namespace API\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

class JwtMiddleware
{
    private string $secretKey;

    public function __construct(string $secretKey)
    {
        $this->secretKey = $secretKey;
    }

    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $token = $request->getCookieParams()['token'] ?? null;

        if (empty($token)) {
            return $this->unauthorizedResponse($request, 'Token not found in cookies');
        }

        try {
            $decoded = JWT::decode($token, new Key($this->secretKey, 'HS256'));

            $request = $request->withAttribute('user', $decoded);
        } catch (\UnexpectedValueException $e) {
            return $this->unauthorizedResponse($request, 'Invalid token');
        } catch (\DomainException $e) {
            return $this->unauthorizedResponse($request, 'Invalid token');
        } catch (\Exception $e) {
            return $this->unauthorizedResponse($request, 'Token verification failed');
        }

        return $handler->handle($request);
    }

    private function unauthorizedResponse(Request $request, string $message): Response
    {
        $response = new \Slim\Psr7\Response();

        $response->getBody()->write(json_encode([
            'message' => $message
        ], JSON_UNESCAPED_UNICODE));

        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }
}
