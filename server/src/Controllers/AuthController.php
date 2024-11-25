<?php

namespace API\Controllers;

use Firebase\JWT\JWT;
use PDO;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AuthController
{
    private PDO $db;
    private string $secretKey;

    public function __construct(PDO $db, string $secretKey)
    {
        $this->db = $db;
        $this->secretKey = $secretKey;
    }

    private function jsonResponse(Response $response, array $data, int $statusCode): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($statusCode);
    }

    // No JWT required
    public function signup(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody()->getContents(), true);
        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (empty($name) || empty($email) || empty($password)) {
            return $this->jsonResponse($response, ['message' => 'Name, email, and password are required'], 400);
        }

        try {
            $stmt = $this->db->prepare("SELECT id FROM users WHERE email = :email");
            $stmt->execute(['email' => $email]);
            if ($stmt->fetch()) {
                return $this->jsonResponse($response, ['message' => 'Email is already registered'], 409);
            }

            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

            $stmt = $this->db->prepare("INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :password) RETURNING id, name");
            $stmt->execute([
                'name' => $name,
                'email' => $email,
                'password' => $hashedPassword
            ]);

            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            $userId = $user['id'];
            $userName = $user['name'];

            $payload = [
                'iss' => $_SERVER['HTTP_HOST'] ?? 'localhost',
                'exp' => time() + 3600,
                'iat' => time(),
                'uId' => $userId,
                'sub' => $userName
            ];

            $jwt = JWT::encode($payload, $this->secretKey, 'HS256');

            setcookie('token', $jwt, [
                'expires' => time() + 3600,
                'path' => '/',
                'domain' => '',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Strict'
            ]);

            return $this->jsonResponse($response, [
                'message' => 'Signup successful',
            ], 201);
        } catch (\PDOException $e) {
            error_log('Error during user signup: ' . $e->getMessage());
            return $this->jsonResponse($response, ['message' => 'Failed to create user. Please try again later.'], 500);
        }
    }

    // No JWT required
    public function login(Request $request, Response $response, $args)
    {
        $data = json_decode($request->getBody()->getContents(), true);
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        try {
            $stmt = $this->db->prepare("SELECT id, name, password_hash FROM users WHERE email = :email");
            $stmt->execute(['email' => $email]);
            $user = $stmt->fetch();

            if ($user && password_verify($password, $user['password_hash'])) {
                $payload = [
                    'iss' => $_SERVER['HTTP_HOST'],
                    'exp' => time() + 3600,
                    'iat' => time(),
                    'uId' => $user['id'],
                    'sub' => $user['name']
                ];

                $jwt = JWT::encode($payload, $this->secretKey, 'HS256');

                setcookie('token', $jwt, [
                    'expires' => time() + 3600,
                    'path' => '/',
                    'domain' => 'localhost',
                    'secure' => false,
                    'httponly' => true,
                    'samesite' => 'Strict'
                ]);

                return $this->jsonResponse($response, [
                    'message' => 'log in successful',
                ], 200);
            } else {
                return $this->jsonResponse($response, ['message' => 'Invalid email or password'], 401);
            }
        } catch (\PDOException $e) {
            return $this->jsonResponse($response, ['message' => 'Failed to login. Please try again later.'], 500);
        }
    }

    // Requires JWT
    public function logout(Request $request, Response $response, $args)
    {
        setcookie('token', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'domain' => 'localhost',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Strict'
        ]);

        return $this->jsonResponse($response, ['message' => 'log out successful'], 200);
    }

    // Requires JWT
    public function checkToken(Request $request, Response $response, $args)
    {
        $user = $request->getAttribute('user');

        $userName = $user->sub;
        $userId = $user->uId;

        return $this->jsonResponse($response, ['name' => $userName, 'user_id' => $userId], 200);
    }
}
