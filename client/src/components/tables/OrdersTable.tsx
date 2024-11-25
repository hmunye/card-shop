import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { DropdownMenu } from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchRequest } from "@/lib/fetch";
import { Order } from "@/lib/types";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Ellipsis } from "lucide-react";
import { toast } from "sonner";

export default function OrdersTable({ orders }: { orders: Order[] }) {
  const getRandomShippingDate = () => {
    const today = new Date();
    const randomDays = Math.floor(Math.random() * 10) + 1;
    today.setDate(today.getDate() + randomDays);
    return today.toLocaleDateString();
  };

  const handleCancelOrder = async (orderId: string) => {
    const cancelOrderRequest = fetchRequest({
      url: `http://localhost:8080/api/orders/${orderId}`,
      method: "DELETE",
    });

    toast.promise(cancelOrderRequest, {
      loading: "Loading...",
      success: async () => {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        return "Your Order Has Been Canceled";
      },
      error: (response) => {
        return `${response.error.message}`;
      },
    });
  };

  return (
    <Card className="animate-in">
      <CardHeader className="flex flex-row justify-between">
        <CardDescription className="text-xl">Manage Orders</CardDescription>
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
              <TableHead className="text-lg">Order Date</TableHead>
              <TableHead className="text-lg">Estimated Shipping</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.order_id}>
                  <TableCell className="hidden sm:table-cell">
                    <img
                      src={order.image_url}
                      alt={order.title}
                      className="w-full h-auto max-h-[650px] object-contain rounded-lg"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-xl">
                    {order.title}
                  </TableCell>
                  <TableCell className="text-xl">{order.brand}</TableCell>
                  <TableCell className="text-xl">
                    ${Number.parseFloat(order.price).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-xl">{order.buyer_name}</TableCell>
                  <TableCell className="text-xl">{order.seller_name}</TableCell>
                  <TableCell className="text-xl">
                    {new Date(order.order_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-xl">
                    {getRandomShippingDate()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <Ellipsis className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-48 bg-muted rounded-md py-2 px-4">
                        <DropdownMenuItem
                          className="text-lg cursor-pointer outline-0"
                          onClick={() => handleCancelOrder(order.order_id)}
                        >
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground text-lg"
                >
                  No orders found
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
