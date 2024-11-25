export type Order = {
  order_id: string; // Unique identifier for the order
  order_date: string; // Date the order was placed (ISO 8601 format)
  updated_at: string; // Date the order was last updated (ISO 8601 format)
  card_id: string; // Unique identifier for the card
  brand: string; // Brand of the card
  title: string; // Title/description of the card
  price: string; // Price of the card as a string (potentially due to decimal precision)
  grade: string; // Grade of the card (e.g., PSA 9.5)
  image_url: string; // URL to the image of the card
  buyer_id: string; // Unique identifier for the buyer
  buyer_name: string; // Name of the buyer
  seller_id: string; // Unique identifier for the seller
  seller_name: string; // Name of the seller
};

export type Transaction = {
  transaction_id: string; // Unique identifier for the transaction
  transaction_date: string; // Date the transaction took place (ISO 8601 format)
  updated_at: string; // Date the transaction was last updated (ISO 8601 format)
  card_id: string; // Unique identifier for the card (UUID)
  brand: string; // Brand of the card (e.g., Pokemon)
  title: string; // Title/description of the card
  price: string; // Price of the card (as a string due to potential decimal precision)
  grade: string; // Grade of the card (e.g., PSA 10)
  image_url: string; // URL to the image of the card
  seller_id: string; // Unique identifier for the seller (UUID)
  seller_name: string; // Name of the seller
  buyer_id: string; // Unique identifier for the buyer (UUID)
  buyer_name: string; // Name of the buyer
};

export type Card = {
  id: string; // Unique identifier for the card
  brand: string; // Brand of the card (e.g., Pokemon, Magic: The Gathering)
  title: string; // Title of the card (e.g., "Charizard", "Pikachu")
  description: string; // Description of the card, e.g., rarity or significance
  grade: string; // Grade of the card (e.g., PSA 10, BGS 9.5)
  price: string; // Price of the card in string format (could represent monetary value)
  image_url: string; // URL to the image of the card for display
  status: string; // Status of the card (e.g., "available", "sold", "pending")
  seller_id: string; // Unique identifier for the seller of the card
  seller_name: string; // Name of the seller of the card
  seller_email: string; // Email address of the seller for communication purposes
};
