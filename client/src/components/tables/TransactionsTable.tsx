import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from "@/lib/types";

export default function TransactionTable({
  transactions,
}: { transactions: Transaction[] }) {
  return (
    <Card className="w-full sm:w-1/2">
      <CardHeader>
        <CardDescription className="text-2xl font-semibold leading-none tracking-tight text-foreground">
          Recent Sold Listings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px] sm:table-cell">
                <span className="sr-only">Image</span>
              </TableHead>
              <TableHead className="text-lg">Title</TableHead>
              <TableHead className="text-lg">Brand</TableHead>
              <TableHead className="text-lg">Price</TableHead>
              <TableHead className="text-lg">Buyer</TableHead>
              <TableHead className="text-lg">Seller</TableHead>
              <TableHead className="text-lg">Date Sold</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.transaction_id}>
                  <TableCell className="hidden sm:table-cell">
                    <img
                      src={transaction.image_url}
                      alt={transaction.title}
                      className="w-full h-auto max-h-[650px] object-contain rounded-lg mb-4"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-xl">
                    {transaction.title}
                  </TableCell>
                  <TableCell className="text-xl">{transaction.brand}</TableCell>
                  <TableCell className="text-xl">
                    ${Number.parseFloat(transaction.price).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xl">
                    {transaction.buyer_name}
                  </TableCell>
                  <TableCell className="text-xl">
                    {transaction.seller_name}
                  </TableCell>
                  <TableCell className="text-xl">
                    {new Date(
                      transaction.transaction_date,
                    ).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground text-lg"
                >
                  No transactions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-muted-foreground text-md"></div>
      </CardFooter>
    </Card>
  );
}
