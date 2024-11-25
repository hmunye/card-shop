import CheckOutForm from "@/components/forms/CheckOutForm";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router";

export default function CheckOut() {
  const { cart, removeFromCart } = useCart();

  const subtotal = cart.reduce(
    (total, item) => total + Number.parseFloat(item.price),
    0,
  );
  const serviceFee = subtotal * 0.05;
  const shippingFee = 20;
  const total = subtotal + serviceFee + shippingFee;

  return (
    <div className="max-w-5xl mx-auto p-4 mt-24">
      <div className="absolute top-10 left-10">
        <Button className="relative text-xl">
          <Link to="/" className="flex justify-center items-center gap-2">
            <ChevronLeft />
            Back
          </Link>
        </Button>
      </div>
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      {cart.length === 0 ? (
        <p className="text-xl">
          Your cart is empty. Please add some items to checkout.
        </p>
      ) : (
        <div className="flex flex-col md:flex-row gap-6 animate-in">
          {/* Cart Summary */}
          <div className="flex-1 pr-4  border-0 md:border-r md:border-gray-300">
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 border rounded-lg p-4"
                >
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h2 className="text-lg font-bold">{item.title}</h2>
                    <p className="text-md text-foreground pt-5">
                      Price: ${Number.parseFloat(item.price).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <div className="pt-10 space-y-4 text-xl">
              <p className="text-lg">
                Subtotal: $
                {Number.parseFloat(subtotal.toFixed(2)).toLocaleString()}
              </p>
              <p className="text-lg">
                Service Fee (5%): $
                {Number.parseFloat(serviceFee.toFixed(2)).toLocaleString()}
              </p>
              <p className="text-lg">Shipping Fee: ${shippingFee.toFixed(2)}</p>
              <p className="text-xl font-bold">
                Total: ${Number.parseFloat(total.toFixed(2)).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex-1 pl-4">
            <CheckOutForm />
          </div>
        </div>
      )}
    </div>
  );
}
