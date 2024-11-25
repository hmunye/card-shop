import OrdersTable from "@/components/tables/OrdersTable";
import { fetchRequest } from "@/lib/fetch";
import { Order } from "@/lib/types";
import { useEffect, useState } from "react";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const getOrderData = async () => {
      const response = await fetchRequest<Order[]>({
        url: "http://localhost:8080/api/users/orders",
        method: "GET",
      });

      if (response.error) {
        console.log(response.error.message);
        return;
      }

      setOrders(response.success!);
    };

    getOrderData();
  }, []);

  return (
    <main className="min-h-screen flex flex-col antialiased animate-in">
      <h1 className="text-5xl my-5">Your Orders</h1>
      <section>
        <OrdersTable orders={orders} />
      </section>
    </main>
  );
}
