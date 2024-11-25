import ListingsTable from "@/components/tables/ListingsTable";
import { fetchRequest } from "@/lib/fetch";
import { Card } from "@/lib/types";
import { useEffect, useState } from "react";

export default function Listings() {
  const [cards, setCards] = useState<Card[]>([]);

  useEffect(() => {
    const getCardData = async () => {
      const response = await fetchRequest<Card[]>({
        url: "http://localhost:8080/api/users/cards",
        method: "GET",
      });

      if (response.error) {
        console.log(response.error.message);
        return;
      }

      setCards(response.success!);
    };

    getCardData();
  }, []);

  return (
    <main className="min-h-screen flex flex-col antialiased animate-in">
      <h1 className="text-5xl my-5">Your Listings</h1>
      <section>
        <ListingsTable cards={cards} />
      </section>
    </main>
  );
}
