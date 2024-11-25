import CardView from "@/components/custom/CardView";
import SearchBar from "@/components/custom/SearchBar";
import { useAuth } from "@/contexts/AuthContext";
import { fetchRequest } from "@/lib/fetch";
import { Card } from "@/lib/types";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Home() {
  const { userId } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filter, setFilter] = useState<string>("title");
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(Number.POSITIVE_INFINITY);

  useEffect(() => {
    const getCardData = async () => {
      const response = await fetchRequest<Card[]>({
        url: "http://localhost:8080/api/cards",
        method: "GET",
      });

      if (response.error) {
        console.log(response.error.message);
        return;
      }

      if (userId) {
        const filteredCards = response.success!.filter(
          (card: Card) => card.seller_id !== userId,
        );
        setCards(filteredCards);
      } else {
        setCards(response.success!);
      }
    };

    getCardData();
  }, [userId]);

  const priceRanges = [
    { label: "$0 - $100", min: 0, max: 100 },
    { label: "$100 - $500", min: 100, max: 500 },
    { label: "$500 - $1,000", min: 500, max: 1000 },
    { label: "$1,000 - $5,000", min: 1000, max: 5000 },
    { label: "$5,000 - $10,000", min: 5000, max: 10000 },
    { label: "$10,000 - $50,000", min: 10000, max: 50000 },
    { label: "$50,000 - $100,000", min: 50000, max: 100000 },
    { label: "$100,000 - $500,000", min: 100000, max: 500000 },
    { label: "$500,000 - $1M", min: 500000, max: 1000000 },
    { label: "$1M - $5M", min: 1000000, max: 5000000 },
    { label: "$5M - $10M", min: 5000000, max: 10000000 },
    { label: "$10M+", min: 10000000, max: 10000000 },
  ];

  const setPriceRange = (min: number, max: number) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const filteredCards = cards.filter((card) => {
    const price = card.price;
    return (
      card[filter as keyof Card]
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) &&
      Number.parseFloat(price) >= minPrice &&
      Number.parseFloat(price) <= maxPrice
    );
  });

  return (
    <div className="animate-in">
      <h1 className="text-5xl my-5">All Cards Listings</h1>
      <main className="min-h-screen flex flex-col items-center antialiased">
        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filter={filter}
          setFilter={setFilter}
          priceRanges={priceRanges}
          setPriceRange={setPriceRange}
          cards={cards}
        />

        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <AnimatePresence>
              {filteredCards.map((card) => (
                <motion.div
                  key={card.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                >
                  <CardView card={card} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex justify-center items-center w-full mt-10">
            <p className="text-3xl text-center">No cards found</p>
          </div>
        )}
      </main>
    </div>
  );
}
