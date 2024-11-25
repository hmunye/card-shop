<?php

namespace API\Controllers;

use PDO;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CommerceController
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    private function jsonResponse(Response $response, array $data, int $statusCode): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($statusCode);
    }

    // Requires JWT
    public function createCardListing(Request $request, Response $response, $args)
    {
        $user = $request->getAttribute('user');
        $sellerId = $user->uId;

        $data = json_decode($request->getBody()->getContents(), true);
        $brand = $data['brand'] ?? null;
        $title = $data['title'] ?? null;
        $description = $data['description'] ?? null;
        $grade = $data['grade'] ?? null;
        $price = $data['price'] ?? null;
        $imageUrl = $data['image_url'] ?? null;

        if (!$brand || !$title || !$description || !$grade || !$price || !$imageUrl) {
            return $this->jsonResponse($response, ['message' => 'All fields are required'], 400);
        }

        try {
            $stmt = $this->db->prepare("INSERT INTO cards (seller_id, brand, title, description, grade, price, image_url, status) 
                                    VALUES (:seller_id, :brand, :title, :description, :grade, :price, :image_url, 'available')");
            $stmt->execute([
                'seller_id' => $sellerId,
                'brand' => $brand,
                'title' => $title,
                'description' => $description,
                'grade' => $grade,
                'price' => $price,
                'image_url' => $imageUrl
            ]);

            return $this->jsonResponse($response, ['message' => 'Card listed successfully'], 201);
        } catch (\PDOException $e) {
            // Check for duplicate entry error (unique constraint violation)
            if ($e->getCode() === '23505') {
                return $this->jsonResponse($response, [
                    'message' => 'A card with the same brand, title, and grade already exists.'
                ], 409);
            }

            error_log($e->getMessage());
            return $this->jsonResponse($response, ['message' => 'Failed to list card. Please try again later.'], 500);
        }
    }

    // No JWT required
    public function getAllCards(Request $request, Response $response, $args)
    {
        try {
            $stmt = $this->db->prepare("SELECT c.id, c.brand, c.title, c.description, c.grade, c.price, c.image_url, c.status, 
                                              u.id AS seller_id, u.name AS seller_name, u.email AS seller_email
                                       FROM cards c
                                       JOIN users u ON c.seller_id = u.id");
            $stmt->execute();
            $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $this->jsonResponse($response, $cards, 200);
        } catch (\PDOException $e) {
            return $this->jsonResponse($response, ['message' => 'Failed to retrieve cards. Please try again later.'], 500);
        }
    }

    // Requires JWT
    public function getCardListing(Request $request, Response $response, $args)
    {
        $user = $request->getAttribute('user');

        try {
            $stmt = $this->db->prepare("SELECT c.id, c.brand, c.title, c.description, c.grade, c.price, c.image_url, c.status,
                                              u.id AS seller_id, u.name AS seller_name, u.email AS seller_email
                                       FROM cards c
                                       JOIN users u ON c.seller_id = u.id
                                       WHERE c.seller_id = :userId");
            $stmt->execute(['userId' => $user->uId]);
            $cards = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $this->jsonResponse($response, $cards, 200);
        } catch (\PDOException $e) {
            return $this->jsonResponse($response, ['message' => 'Failed to retrieve user cards. Please try again later.'], 500);
        }
    }

    // Requires JWT (Soft Delete)
    public function removeCardListing(Request $request, Response $response, $args)
    {
        // Access the path parameter 'cardId'
        $cardId = $args['cardId'];

        $user = $request->getAttribute('user');
        $sellerId = $user->uId;

        // Ensure the card exists and belongs to the seller
        try {
            $stmt = $this->db->prepare("SELECT seller_id, status FROM cards WHERE id = :card_id");
            $stmt->execute(['card_id' => $cardId]);
            $card = $stmt->fetch();

            if (!$card) {
                return $this->jsonResponse($response, ['message' => 'Card not found'], 404);
            }

            if ($card['seller_id'] != $sellerId) {
                return $this->jsonResponse($response, ['message' => 'You are not the seller of this card'], 403);
            }

            // Update the card status to 'not available' (soft delete)
            $stmt = $this->db->prepare("UPDATE cards SET status = 'not available' WHERE id = :card_id");
            $stmt->execute(['card_id' => $cardId]);

            return $this->jsonResponse($response, ['message' => 'Card listing removed successfully'], 200);
        } catch (\PDOException $e) {
            return $this->jsonResponse($response, ['message' => 'Failed to remove card listing. Please try again later.'], 500);
        }
    }

    // Requires JWT
    public function relistCard(Request $request, Response $response, $args)
    {
        // Access the path parameter 'cardId'
        $cardId = $args['cardId'];

        $user = $request->getAttribute('user');
        $sellerId = $user->uId;

        try {
            // Check if the card exists and belongs to the seller
            $stmt = $this->db->prepare("SELECT seller_id, status FROM cards WHERE id = :card_id");
            $stmt->execute(['card_id' => $cardId]);
            $card = $stmt->fetch();

            if (!$card) {
                return $this->jsonResponse($response, ['message' => 'Card not found'], 404);
            }

            if ($card['seller_id'] != $sellerId) {
                return $this->jsonResponse($response, ['message' => 'You are not the seller of this card'], 403);
            }

            // Ensure the card is 'not available' (soft delete)
            if ($card['status'] != 'not available') {
                return $this->jsonResponse($response, ['message' => 'Card is not removed or already relisted'], 400);
            }

            // Relist the card (update status to 'available')
            $stmt = $this->db->prepare("UPDATE cards SET status = 'available' WHERE id = :card_id");
            $stmt->execute(['card_id' => $cardId]);

            return $this->jsonResponse($response, ['message' => 'Card relisted successfully'], 200);
        } catch (\PDOException $e) {
            return $this->jsonResponse($response, ['message' => 'Failed to relist card. Please try again later.'], 500);
        }
    }

    // Requires JWT
    public function sellCard(Request $request, Response $response, $args)
    {
        // Access the path parameter 'cardId'
        $cardId = $args['cardId'];

        error_log("Card ID: " . $cardId);

        $user = $request->getAttribute('user');
        $buyerId = $user->uId;

        error_log("Buyer ID: " . $buyerId);

        try {
            // Check if the card exists and is available for sale
            $stmt = $this->db->prepare("SELECT seller_id, price FROM cards WHERE id = :card_id AND status = 'available'");
            $stmt->execute(['card_id' => $cardId]);
            $card = $stmt->fetch();

            if (!$card) {
                return $this->jsonResponse($response, ['message' => 'Card not found or not available'], 404);
            }

            if ($card['seller_id'] == $buyerId) {
                return $this->jsonResponse($response, ['message' => 'Buyer cannot be the seller of the card'], 400);
            }

            // Proceed with the transaction (insert into transactions and orders)
            $this->db->beginTransaction();

            $stmt = $this->db->prepare("INSERT INTO transactions (buyer_id, seller_id, card_id) VALUES (:buyer_id, :seller_id, :card_id) RETURNING id");
            $stmt->execute(['buyer_id' => $buyerId, 'seller_id' => $card['seller_id'], 'card_id' => $cardId]);
            $transaction = $stmt->fetch();
            $transactionId = $transaction['id'];

            $stmt = $this->db->prepare("INSERT INTO orders (buyer_id, card_id, transaction_id) VALUES (:buyer_id, :card_id, :transaction_id)");
            $stmt->execute(['buyer_id' => $buyerId, 'card_id' => $cardId, 'transaction_id' => $transactionId]);

            $this->db->commit();

            return $this->jsonResponse($response, ['message' => 'Card sold and order created successfully', 'transaction_id' => $transactionId], 201);
        } catch (\PDOException $e) {
            $this->db->rollBack();
            error_log("PDOException: " . $e->getMessage());
            return $this->jsonResponse($response, ['message' => 'Failed to sell card or create order. Please try again later.'], 500);
        }
    }

    // Requires JWT
    public function getUserTransactions(Request $request, Response $response, $args)
    {
        $user = $request->getAttribute('user');
        $userId = $user->uId;

        try {
            $stmt = $this->db->prepare(
                "SELECT t.id AS transaction_id, t.transaction_date, t.updated_at,
                    c.id AS card_id, c.brand, c.title, c.price, c.grade, c.image_url,
                    u_seller.id AS seller_id, u_seller.name AS seller_name,
                    u_buyer.id AS buyer_id, u_buyer.name AS buyer_name
             FROM transactions t
             JOIN cards c ON t.card_id = c.id
             JOIN users u_seller ON t.seller_id = u_seller.id
             JOIN users u_buyer ON t.buyer_id = u_buyer.id
             WHERE t.seller_id = :userId"
            );
            $stmt->execute(['userId' => $userId]);
            $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $this->jsonResponse($response, $transactions, 200);
        } catch (\PDOException $e) {
            return $this->jsonResponse($response, ['message' => 'Failed to retrieve transactions. Please try again later.'], 500);
        }
    }

    // Requires JWT
    public function getUserOrders(Request $request, Response $response, $args)
    {
        $user = $request->getAttribute('user');
        $userId = $user->uId;

        try {
            // Query for orders where the user is the buyer
            $stmt = $this->db->prepare(
                "SELECT o.id AS order_id, o.order_date, o.updated_at,
                    c.id AS card_id, c.brand, c.title, c.price, c.grade, c.image_url,
                    u_buyer.id AS buyer_id, u_buyer.name AS buyer_name,
                    u_seller.id AS seller_id, u_seller.name AS seller_name
             FROM orders o
             JOIN cards c ON o.card_id = c.id
             JOIN users u_buyer ON o.buyer_id = u_buyer.id
             JOIN users u_seller ON c.seller_id = u_seller.id
             WHERE o.buyer_id = :userId"
            );
            $stmt->execute(['userId' => $userId]);
            $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

            return $this->jsonResponse($response, $orders, 200);
        } catch (\PDOException $e) {
            return $this->jsonResponse($response, ['message' => 'Failed to retrieve orders. Please try again later.'], 500);
        }
    }

    // Requires JWT
    public function cancelOrder(Request $request, Response $response, $args)
    {
        // Access the path parameter 'orderId'
        $orderId = $args['orderId'];

        $user = $request->getAttribute('user');
        $buyerId = $user->uId;

        try {
            // Check if the order exists and belongs to the buyer
            $stmt = $this->db->prepare(
                "SELECT o.buyer_id, o.card_id, o.transaction_id
             FROM orders o
             WHERE o.id = :order_id"
            );
            $stmt->execute(['order_id' => $orderId]);
            $order = $stmt->fetch();

            if (!$order) {
                return $this->jsonResponse($response, ['message' => 'Order not found'], 404);
            }

            if ($order['buyer_id'] != $buyerId) {
                return $this->jsonResponse($response, ['message' => 'You are not authorized to cancel this order'], 403);
            }

            // Start transaction
            $this->db->beginTransaction();

            // Update the card's status back to 'available'
            $stmt = $this->db->prepare("UPDATE cards SET status = 'available' WHERE id = :card_id");
            $stmt->execute(['card_id' => $order['card_id']]);

            // Delete the order
            $stmt = $this->db->prepare("DELETE FROM orders WHERE id = :order_id");
            $stmt->execute(['order_id' => $orderId]);

            // Delete the associated transaction
            $stmt = $this->db->prepare("DELETE FROM transactions WHERE id = :transaction_id");
            $stmt->execute(['transaction_id' => $order['transaction_id']]);

            // Commit transaction
            $this->db->commit();

            return $this->jsonResponse($response, ['message' => 'Order and associated transaction cancelled successfully'], 200);
        } catch (\PDOException $e) {
            $this->db->rollBack();
            return $this->jsonResponse($response, ['message' => 'Failed to cancel order. Please try again later.'], 500);
        }
    }
}
