CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; 

CREATE TYPE card_status AS ENUM ('available', 'not available', 'sold');

CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL CHECK (length(name) > 0),
    email VARCHAR(255) NOT NULL UNIQUE CHECK(length(email) > 0),
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE cards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    brand VARCHAR(50) NOT NULL CHECK (length(brand) > 0),
    title VARCHAR(255) NOT NULL CHECK (length(title) > 0),
    description VARCHAR(255) NOT NULL CHECK (length(description) > 0),
    grade VARCHAR(50) NOT NULL CHECK (length(grade) > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    image_url TEXT NOT NULL,
    status card_status DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_card UNIQUE (brand, title, grade)
);

CREATE TABLE transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    transaction_date TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT buyer_seller_different CHECK (buyer_id <> seller_id)
);

CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    order_date TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_card_status_after_transaction()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE cards
    SET status = 'sold', updated_at = NOW()
    WHERE id = NEW.card_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_card_status_on_transaction_insert
AFTER INSERT ON transactions
FOR EACH ROW
EXECUTE FUNCTION update_card_status_after_transaction();

-------------------------------------------------------------------------------

-- Password is 'password'
INSERT INTO users (name, email, password_hash) VALUES
('John Doe', 'johndoe@example.com', '$2y$10$FPRH8BTYE9Ig6ojmz5073uO31QK6ZL0Z2CBa6hxHmJeXTIhOvgUwK'),
('Jane Smith', 'janesmith@example.com', '$2y$10$FPRH8BTYE9Ig6ojmz5073uO31QK6ZL0Z2CBa6hxHmJeXTIhOvgUwK'),
('Alice Johnson', 'alicej@example.com', '$2y$10$FPRH8BTYE9Ig6ojmz5073uO31QK6ZL0Z2CBa6hxHmJeXTIhOvgUwK'),
('Bob Brown', 'bobb@example.com', '$2y$10$FPRH8BTYE9Ig6ojmz5073uO31QK6ZL0Z2CBa6hxHmJeXTIhOvgUwK'),
('Charlie White', 'charliew@example.com', '$2y$10$FPRH8BTYE9Ig6ojmz5073uO31QK6ZL0Z2CBa6hxHmJeXTIhOvgUwK');

INSERT INTO cards (seller_id, brand, title, description, grade, price, image_url)
VALUES
  ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 'Pokemon', 'Tamamushi University Magikarp (1998)', 'Rare and sought after Pokémon card', 'PSA 10', 78000.00, 'https://mktg-assets.tcgplayer.com/content/pokemon/_2024/MAR/04/University-Magikarp.jpg'),
  ((SELECT id FROM users WHERE email = 'janesmith@example.com'), 'Pokemon', 'Snap Gyarados (1999)', 'Limited edition Snap Gyarados card', 'PSA 9.5', 87500.00, 'https://mktg-assets.tcgplayer.com/content/pokemon/_2024/MAR/04/Snap-Gyarados.jpg'),
  ((SELECT id FROM users WHERE email = 'alicej@example.com'), 'Pokemon', 'Pokémon World Championships No. 2 Trainer Promo (2006)', 'Promo card from World Championships', 'PSA 9', 110100.00, 'https://mktg-assets.tcgplayer.com/content/pokemon/7_23/14/Pokemon-World-Championship-No-2-Trainer-Promo.jpg'),
  ((SELECT id FROM users WHERE email = 'bobb@example.com'), 'Pokemon', 'Snap Magikarp (1999)', 'Unique Snap Magikarp from 1999', 'PSA Authentic', 136000.00, 'https://mktg-assets.tcgplayer.com/content/pokemon/_2024/MAR/04/Snap%20Magikarp.jpeg'),
  ((SELECT id FROM users WHERE email = 'charliew@example.com'), 'Pokemon', 'Neo Genesis 1st Edition Lugia (2000)', '1st Edition Neo Genesis Lugia', 'BGS 10', 144300.00, 'https://mktg-assets.tcgplayer.com/content/pokemon/7_23/14/Neo-Genesis-1st-Edition-Lugia.jpg'),
  ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 'Pokemon', 'Super Secret Battle No. 1 Trainer (1999)', 'Extremely rare promo card from the secret battle', 'PSA 10', 156000.00, 'https://mktg-assets.tcgplayer.com/content/pokemon/7_23/14/Super-Secret-Battle-No-1-Trainer-1999.jpg'),
  ((SELECT id FROM users WHERE email = 'janesmith@example.com'), 'Pokemon', 'Extra Battle Day Lillie (2019)', 'Limited edition card from the Extra Battle Day event', 'PSA 10', 171000.00, 'https://mktg-assets.tcgplayer.com/content/pokemon/_2024/MAR/04/Extra-Battle-Day-Lillie.jpg'),
  ((SELECT id FROM users WHERE email = 'alicej@example.com'), 'Pokemon', 'Family Event Trophy Kangaskhan (1998)', 'Award-winning Family Event Trophy card', 'PSA 10', 175000.00, 'https://mktg-assets.tcgplayer.com/content/pokemon/7_23/14/Family-Event-Trophy-Kangaskhan.jpg'),
  ((SELECT id FROM users WHERE email = 'bobb@example.com'), 'Pokemon', 'Umbreon Gold Star, Japanese 70,000 Points PLAY Promo (2005)', 'Highly sought-after Gold Star Umbreon card', 'PSA 10', 180000.00, 'https://mktg-assets.tcgplayer.com/content/pokemon/_2024/MAR/04/Japanese-Umbreon-Star.jpg'),
  ((SELECT id FROM users WHERE email = 'charliew@example.com'), 'Pokemon', 'First Edition Shadowless Holographic Charizard #4 (1999)', 'Rare first edition Shadowless Holo Charizard', 'PSA 10', 420000.00, 'https://mktg-assets.tcgplayer.com/content/pokemon/7_23/14/1st-Edition-Charizard.jpg'),
  ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 'Pokemon', 'Trophy No.2 Pikachu, Silver 2nd Place, Second Tournament (1998)', 'Second-place Pikachu trophy card', 'PSA 10', 440000.00, 'https://mktg-assets.tcgplayer.com/content/pokemon/_2024/MAR/04/Pikachu-Trophy-No2-2nd-Tournament.jpg'),
  ((SELECT id FROM users WHERE email = 'janesmith@example.com'), 'Pokemon', 'Tsunekazu Ishihara Signed Promo (2017)', 'Signed by Tsunekazu Ishihara, promo card', 'PSA 9', 247230.00, 'https://mktg-assets.tcgplayer.com/content/pokemon/7_23/14/Tsunekazu-Ishihara-Signed-Promo.jpg');

INSERT INTO cards (seller_id, brand, title, description, grade, price, image_url)
VALUES
  ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 'Yu-Gi-Oh', 'Black Luster Soldier (Stainless Steel)', 'This card is the only instance of a card being printed using stainless steel', 'PSA 10', 10000000.00, 'https://aura-print.com/media/wysiwyg/AP_Blog_Yu_Gi_Oh_Black_Luster_Soldier_1.jpg'),
  ((SELECT id FROM users WHERE email = 'janesmith@example.com'), 'Yu-Gi-Oh', 'Blue-Eyes Ultimate Dragon (T3-01)', 'This card was given to the winner of the Asia Championships in 2001. It is encased and autographed by Kazuki Takashi, the creator of Yu-Gi-Oh', 'PSA 9.5', 400000.00, 'https://aura-print.com/media/wysiwyg/AP_Blog_Yu_Gi_Oh_Blue_Eyes_Ultimate_Dragon_1.jpg'),
  ((SELECT id FROM users WHERE email = 'alicej@example.com'), 'Yu-Gi-Oh', 'Tyler The Great Warrior', 'This card is a one of a kind make a wish card designed by a boy named Tyler who was suffering from cancer at the time. Tyler has since made a full recovery', 'PSA 8.5', 311211.00, 'https://aura-print.com/media/wysiwyg/AP_Blog_Yu_Gi_Oh_Tyler_The_Great_Warrior_1.jpg'),
  ((SELECT id FROM users WHERE email = 'bobb@example.com'), 'Yu-Gi-Oh', 'Tyr, The Vanquishing Warlord (WCPS-EN801)', 'This card was the award for the 2008 World Championship', 'PSA 9.5', 325000.00, 'https://aura-print.com/media/wysiwyg/AP_Blog_Yu_Gi_Oh_Tyr_The_Vanquishing_Warlord_1.jpg'),
  ((SELECT id FROM users WHERE email = 'charliew@example.com'), 'Yu-Gi-Oh', 'Legendary Magician Of Dark (2012-EN002)', 'This card was the prize card during the landmark tenth Yu-Gi-Oh! World Championships in 2010', 'PSA 10', 75999.00, 'https://aura-print.com/media/wysiwyg/AP_Blog_Yu_Gi_Oh_Legendary_Magician_Of_Dark_1.jpg'),
  ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 'Yu-Gi-Oh', 'Legendary Dragon Of White (2012-EN001)', 'This card made a remarkable comeback in the market for the first time since 2015, when it was sold for just $12', 'PSA 10', 72186.00, 'https://aura-print.com/media/wysiwyg/AP_Blog_Yu_Gi_Oh_Legendary_Dragon_Of_White_1.jpg'),
  ((SELECT id FROM users WHERE email = 'janesmith@example.com'), 'Yu-Gi-Oh', 'Kaiser Eagle, The Heavens'' Mandate (2019-EN001)', 'This card was the prize card for the final World Championship in 2019 before in person Yu-Gi-Oh! events entered a hiatus period', 'PSA 8', 70858.00, 'https://aura-print.com/media/wysiwyg/AP_Blog_Yu_Gi_Oh_Kaiser_Eagle_The_Heavens_Mandate_1.jpg'),
  ((SELECT id FROM users WHERE email = 'alicej@example.com'), 'Yu-Gi-Oh', 'Crush Card Virus (SJCS-EN004)', 'This card was exclusive to the victors of the 2007 Shonen Jump Championships', 'PSA 9', 70580.00, 'https://aura-print.com/media/wysiwyg/AP_Blog_Yu_Gi_Oh_Crush_Card_Virus_1.jpg'),
  ((SELECT id FROM users WHERE email = 'bobb@example.com'), 'Yu-Gi-Oh', 'Stardust Divinity (2010-EN001)', 'This card is the only Synchro Monster to be Issued as a prize card', 'PSA 9', 64439.00, 'https://aura-print.com/media/wysiwyg/AP_Blog_Yu_Gi_Oh_Stardust_Divinity_1.jpg'),
  ((SELECT id FROM users WHERE email = 'charliew@example.com'), 'Magic: The Gathering', 'Black Lotus', 'One of the rarest, most expensive cards in MTG, Black Lotus has always been the Magic card', 'PSA 10', 14107.00, 'https://draftsim.com/wp-content/uploads/mtg-card-DB/cards/4/a/4a2e428c-dd25-484c-bbc8-2d6ce10ef42c.jpg'),
  ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 'Magic: The Gathering', 'Timetwister', 'The blue counterpart to Wheel of Fortune, this card not only refills your hand but can shuffle your ‘yard back into your library, giving you access to all of your cards again', 'PSA 8.5', 6500.00, 'https://draftsim.com/wp-content/uploads/mtg-card-DB/cards/0/1/01bda3d7-122a-48a0-bab3-676c4a557b74.jpg'),
  ((SELECT id FROM users WHERE email = 'janesmith@example.com'), 'Magic: The Gathering', 'Ancestral Recall', 'Ancestral Recall was originally part of the same cycle that included Giant Growth and Healing Salve', 'PSA 9', 3680.00, 'https://draftsim.com/wp-content/uploads/mtg-card-DB/cards/2/d/2dd41293-d7c8-4422-9f0c-b3e96350f5c9.jpg'),
  ((SELECT id FROM users WHERE email = 'alicej@example.com'), 'Magic: The Gathering', 'The Tabernacle at Pendrell Vale', 'The Tabernacle at Pendrell Vale, or just “Tabernacle” for short, is a creature-hate card that has risen through the ranks of expensive cards in the last decade or so', 'PSA 10', 3000.00, 'https://draftsim.com/wp-content/uploads/mtg-card-DB/cards/6/4/64bc9b1d-5818-4d9e-b771-e49af4ff9a5c.jpg'),
  ((SELECT id FROM users WHERE email = 'bobb@example.com'), 'Magic: The Gathering', 'Mox Jet', 'Storm decks tend to use black mana a lot, so it’s especially good there', 'PSA 10', 2796.00, 'https://draftsim.com/wp-content/uploads/mtg-card-DB/cards/7/0/70d6c02e-0f48-4fb0-94f3-1fc92ee1814f.jpg'),
  ((SELECT id FROM users WHERE email = 'charliew@example.com'), 'Magic: The Gathering', 'Mox Sapphire', 'All of the original Moxen are powerful, but Sapphire is the king', 'PSA 10', 2735.00, 'https://draftsim.com/wp-content/uploads/mtg-card-DB/cards/f/7/f7d82f1d-631e-4668-9d10-7bf0ee515267.jpg'),
  ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 'Magic: The Gathering', 'Mox Ruby', 'Fast red mana is so strong in Magic, which is why Mox Ruby is often among the most expensive of the Moxen', 'PSA 8', 2504.00, 'https://draftsim.com/wp-content/uploads/mtg-card-DB/cards/2/1/21b7cbae-6647-4f36-b02d-5535ac88b1a6.jpg'),
  ((SELECT id FROM users WHERE email = 'janesmith@example.com'), 'Magic: The Gathering', 'Time Walk', 'THE extra turn spell, and Magic''s best blue sorcery', 'PSA 7', 2428.00, 'https://draftsim.com/wp-content/uploads/mtg-card-DB/cards/a/d/ade7d00d-4e7b-46e9-ace1-63f628a589fc.jpg'),
  ((SELECT id FROM users WHERE email = 'alicej@example.com'), 'Magic: The Gathering', 'Mishra''s Workshop', 'A land that can make 3 mana, but it can only be used for one of the most broken card types in Magic', 'PSA 10', 2400.00, 'https://draftsim.com/wp-content/uploads/mtg-card-DB/cards/1/3/135de5c7-6ac9-4b68-8f1a-97f120a4b125.jpg');

INSERT INTO transactions (buyer_id, seller_id, card_id, transaction_date, updated_at) 
VALUES 
    ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 
    (SELECT id FROM users WHERE email = 'bobb@example.com'), 
    (SELECT id FROM cards WHERE title = 'Mox Jet'), 
    '2024-08-08 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'janesmith@example.com'), 
    (SELECT id FROM users WHERE email = 'alicej@example.com'), 
    (SELECT id FROM cards WHERE title = 'Blue-Eyes Ultimate Dragon (T3-01)'), 
    '2024-09-10 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'alicej@example.com'), 
    (SELECT id FROM users WHERE email = 'bobb@example.com'), 
    (SELECT id FROM cards WHERE title = 'Tyler The Great Warrior'), 
    '2024-05-18 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'bobb@example.com'), 
    (SELECT id FROM users WHERE email = 'charliew@example.com'), 
    (SELECT id FROM cards WHERE title = 'Stardust Divinity (2010-EN001)'), 
    '2024-06-22 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'charliew@example.com'), 
    (SELECT id FROM users WHERE email = 'johndoe@example.com'), 
    (SELECT id FROM cards WHERE title = 'Mox Sapphire'), 
    '2024-10-14 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 
    (SELECT id FROM users WHERE email = 'janesmith@example.com'), 
    (SELECT id FROM cards WHERE title = 'Timetwister'), 
    '2024-03-01 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'janesmith@example.com'), 
    (SELECT id FROM users WHERE email = 'alicej@example.com'), 
    (SELECT id FROM cards WHERE title = 'Ancestral Recall'), 
    '2024-07-07 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'alicej@example.com'), 
    (SELECT id FROM users WHERE email = 'bobb@example.com'), 
    (SELECT id FROM cards WHERE title = 'The Tabernacle at Pendrell Vale'), 
    '2024-11-11 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'bobb@example.com'), 
    (SELECT id FROM users WHERE email = 'charliew@example.com'), 
    (SELECT id FROM cards WHERE title = 'Legendary Dragon Of White (2012-EN001)'), 
    '2024-01-15 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'charliew@example.com'), 
    (SELECT id FROM users WHERE email = 'alicej@example.com'), 
    (SELECT id FROM cards WHERE title = 'Crush Card Virus (SJCS-EN004)'), 
    '2024-04-12 00:00:00', NOW());

INSERT INTO orders (buyer_id, card_id, transaction_id, order_date, updated_at)
VALUES
    ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 
    (SELECT id FROM cards WHERE title = 'Mox Jet'), 
    (SELECT id FROM transactions WHERE buyer_id = (SELECT id FROM users WHERE email = 'johndoe@example.com') 
    AND card_id = (SELECT id FROM cards WHERE title = 'Mox Jet') LIMIT 1), 
    '2024-08-08 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'janesmith@example.com'), 
    (SELECT id FROM cards WHERE title = 'Blue-Eyes Ultimate Dragon (T3-01)'), 
    (SELECT id FROM transactions WHERE buyer_id = (SELECT id FROM users WHERE email = 'janesmith@example.com') 
    AND card_id = (SELECT id FROM cards WHERE title = 'Blue-Eyes Ultimate Dragon (T3-01)') LIMIT 1), 
    '2024-09-10 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'alicej@example.com'), 
    (SELECT id FROM cards WHERE title = 'Tyler The Great Warrior'), 
    (SELECT id FROM transactions WHERE buyer_id = (SELECT id FROM users WHERE email = 'alicej@example.com') 
    AND card_id = (SELECT id FROM cards WHERE title = 'Tyler The Great Warrior') LIMIT 1), 
    '2024-05-18 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'bobb@example.com'), 
    (SELECT id FROM cards WHERE title = 'Stardust Divinity (2010-EN001)'), 
    (SELECT id FROM transactions WHERE buyer_id = (SELECT id FROM users WHERE email = 'bobb@example.com') 
    AND card_id = (SELECT id FROM cards WHERE title = 'Stardust Divinity (2010-EN001)') LIMIT 1), 
    '2024-06-22 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'charliew@example.com'), 
    (SELECT id FROM cards WHERE title = 'Mox Sapphire'), 
    (SELECT id FROM transactions WHERE buyer_id = (SELECT id FROM users WHERE email = 'charliew@example.com') 
    AND card_id = (SELECT id FROM cards WHERE title = 'Mox Sapphire') LIMIT 1), 
    '2024-10-14 00:00:00', NOW());

INSERT INTO transactions (buyer_id, seller_id, card_id, transaction_date, updated_at) 
VALUES 
    ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 
    (SELECT id FROM users WHERE email = 'janesmith@example.com'), 
    (SELECT id FROM cards WHERE title = 'Snap Gyarados (1999)'), 
    '2024-11-05 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'alicej@example.com'), 
    (SELECT id FROM users WHERE email = 'charliew@example.com'), 
    (SELECT id FROM cards WHERE title = 'Tsunekazu Ishihara Signed Promo (2017)'), 
    '2024-11-12 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'bobb@example.com'), 
    (SELECT id FROM users WHERE email = 'johndoe@example.com'), 
    (SELECT id FROM cards WHERE title = 'Trophy No.2 Pikachu, Silver 2nd Place, Second Tournament (1998)'), 
    '2024-11-18 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'charliew@example.com'), 
    (SELECT id FROM users WHERE email = 'alicej@example.com'), 
    (SELECT id FROM cards WHERE title = 'Extra Battle Day Lillie (2019)'), 
    '2024-11-20 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 
    (SELECT id FROM users WHERE email = 'bobb@example.com'), 
    (SELECT id FROM cards WHERE title = 'Stardust Divinity (2010-EN001)'), 
    '2024-11-22 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'janesmith@example.com'), 
    (SELECT id FROM users WHERE email = 'charliew@example.com'), 
    (SELECT id FROM cards WHERE title = 'Neo Genesis 1st Edition Lugia (2000)'), 
    '2024-11-23 00:00:00', NOW());

INSERT INTO orders (buyer_id, card_id, transaction_id, order_date, updated_at)
VALUES
    ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 
    (SELECT id FROM cards WHERE title = 'Snap Gyarados (1999)'), 
    (SELECT id FROM transactions WHERE buyer_id = (SELECT id FROM users WHERE email = 'johndoe@example.com') AND card_id = (SELECT id FROM cards WHERE title = 'Snap Gyarados (1999)')), 
    '2024-11-05 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'alicej@example.com'), 
    (SELECT id FROM cards WHERE title = 'Tsunekazu Ishihara Signed Promo (2017)'), 
    (SELECT id FROM transactions WHERE buyer_id = (SELECT id FROM users WHERE email = 'alicej@example.com') AND card_id = (SELECT id FROM cards WHERE title = 'Tsunekazu Ishihara Signed Promo (2017)')), 
    '2024-11-12 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'bobb@example.com'), 
    (SELECT id FROM cards WHERE title = 'Trophy No.2 Pikachu, Silver 2nd Place, Second Tournament (1998)'), 
    (SELECT id FROM transactions WHERE buyer_id = (SELECT id FROM users WHERE email = 'bobb@example.com') AND card_id = (SELECT id FROM cards WHERE title = 'Trophy No.2 Pikachu, Silver 2nd Place, Second Tournament (1998)')), 
    '2024-11-18 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'charliew@example.com'), 
    (SELECT id FROM cards WHERE title = 'Extra Battle Day Lillie (2019)'), 
    (SELECT id FROM transactions WHERE buyer_id = (SELECT id FROM users WHERE email = 'charliew@example.com') AND card_id = (SELECT id FROM cards WHERE title = 'Extra Battle Day Lillie (2019)')), 
    '2024-11-20 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'johndoe@example.com'), 
    (SELECT id FROM cards WHERE title = 'Stardust Divinity (2010-EN001)'), 
    (SELECT id FROM transactions WHERE buyer_id = (SELECT id FROM users WHERE email = 'johndoe@example.com') AND card_id = (SELECT id FROM cards WHERE title = 'Stardust Divinity (2010-EN001)')), 
    '2024-11-22 00:00:00', NOW()),
    ((SELECT id FROM users WHERE email = 'janesmith@example.com'), 
    (SELECT id FROM cards WHERE title = 'Neo Genesis 1st Edition Lugia (2000)'), 
    (SELECT id FROM transactions WHERE buyer_id = (SELECT id FROM users WHERE email = 'janesmith@example.com') AND card_id = (SELECT id FROM cards WHERE title = 'Neo Genesis 1st Edition Lugia (2000)')), 
    '2024-11-23 00:00:00', NOW());
