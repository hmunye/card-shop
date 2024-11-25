import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { fetchRequest } from "@/lib/fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const checkoutSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().regex(/^\d{5}$/, "Invalid ZIP code"),
  cardNumber: z.string().regex(/^\d{16}$/, "Invalid card number"),
  expirationDate: z.string().regex(/^\d{2}\/\d{2}$/, "Invalid expiration date"),
  cvv: z.string().regex(/^\d{3}$/, "Invalid CVV"),
});

export default function CheckOutForm() {
  const { name } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      address: "",
      city: "",
      state: "",
      zip: "",
      cardNumber: "",
      expirationDate: "",
      cvv: "",
    },
  });

  async function onSubmit() {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    for (const item of cart) {
      const orderRequest = fetchRequest({
        url: `http://localhost:8080/api/cards/${item.id}`,
        method: "PATCH",
      });

      toast.promise(orderRequest, {
        loading: "Loading...",
        success: async (response) => {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          if (item === cart[cart.length - 1]) {
            clearCart();
            navigate("/");
          }
          return `Order for ${name} is now being processed`;
        },
        error: (response) => {
          return `${response.error.message}`;
        },
      });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col space-y-4"
      >
        <h2 className="text-2xl font-semibold">Shipping Details</h2>

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main St" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="City" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input placeholder="State" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zip"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ZIP Code</FormLabel>
              <FormControl>
                <Input placeholder="12345" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h2 className="text-xl font-semibold pt-10">Payment Details</h2>

        <FormField
          control={form.control}
          name="cardNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Card Number</FormLabel>
              <FormControl>
                <Input placeholder="1234123412341234" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expirationDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expiration Date (MM/YY)</FormLabel>
              <FormControl>
                <Input placeholder="12/25" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cvv"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CVV</FormLabel>
              <FormControl>
                <Input placeholder="123" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="bg-success text-success-foreground text-xl hover:bg-success hover:brightness-125 transition duration-300"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <div className="animate-spin border-4 border-solid border-l-transparent rounded-2xl w-6 h-6 border-foreground brightness-75"></div>
          ) : (
            "Place Order"
          )}
        </Button>
      </form>
    </Form>
  );
}
