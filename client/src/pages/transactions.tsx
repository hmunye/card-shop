import TransactionChart from "@/components/charts/TransactionChart";
import TransactionTable from "@/components/tables/TransactionsTable";
import { fetchRequest } from "@/lib/fetch";
import { Order, Transaction } from "@/lib/types";
import { useEffect, useState } from "react";

export default function Transactions() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const getCommerceData = async () => {
      const orderResponse = await fetchRequest<Order[]>({
        url: "http://localhost:8080/api/users/orders",
        method: "GET",
      });

      if (orderResponse.error) {
        console.log(orderResponse.error.message);
        return;
      }

      setOrders(orderResponse.success!);

      const transactionResponse = await fetchRequest<Transaction[]>({
        url: "http://localhost:8080/api/users/transactions",
        method: "GET",
      });

      if (transactionResponse.error) {
        console.log(transactionResponse.error.message);
        return;
      }

      setTransactions(transactionResponse.success!);
    };

    getCommerceData();
  }, []);

  const calculateChartData = (orders: Order[], transactions: Transaction[]) => {
    const data = [];

    const startDate = new Date(
      Math.min(
        ...[
          ...orders.map((order) => new Date(order.order_date).getTime()),
          ...transactions.map((transaction) =>
            new Date(transaction.transaction_date).getTime(),
          ),
        ],
      ),
    );

    const endDate = new Date(
      Math.max(
        ...[
          ...orders.map((order) => new Date(order.order_date).getTime()),
          ...transactions.map((transaction) =>
            new Date(transaction.transaction_date).getTime(),
          ),
        ],
      ),
    );

    startDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(0);

    while (startDate <= endDate) {
      const month = `${startDate.toLocaleString("default", { month: "short" })} ${startDate.getFullYear()}`;

      const moneySpent = orders
        .filter(
          (order) =>
            new Date(order.order_date).getMonth() === startDate.getMonth() &&
            new Date(order.order_date).getFullYear() ===
              startDate.getFullYear(),
        )
        .reduce((sum, order) => sum + Number.parseFloat(order.price), 0);

      const moneyMade = transactions
        .filter(
          (transaction) =>
            new Date(transaction.transaction_date).getMonth() ===
              startDate.getMonth() &&
            new Date(transaction.transaction_date).getFullYear() ===
              startDate.getFullYear(),
        )
        .reduce(
          (sum, transaction) => sum + Number.parseFloat(transaction.price),
          0,
        );

      data.push({
        month: month,
        moneyMade: moneyMade,
        moneySpent: moneySpent,
      });

      startDate.setMonth(startDate.getMonth() + 1);
    }

    return data;
  };

  const chartData = calculateChartData(orders, transactions);

  console.log(chartData);

  return (
    <div className="animate-in">
      <h1 className="text-5xl my-5">Your Transactions</h1>
      <main className="min-h-screen flex flex-col sm:flex-row gap-8 p-8">
        <TransactionChart chartData={chartData} />
        <TransactionTable transactions={transactions} />
      </main>
    </div>
  );
}
