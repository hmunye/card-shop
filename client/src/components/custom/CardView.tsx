import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Card as CardType } from "@/lib/types";
import { useNavigate } from "react-router";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

export default function CardView({ card }: { card: CardType }) {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleCart = async () => {
    if (!isAuthenticated) {
      navigate("/auth/sign-in");
      return;
    }
    if (isInCart(card.id)) {
      removeFromCart(card.id);
    } else {
      addToCart(card);
    }
  };

  return (
    <Card
      className={`hover:brightness-125 transition duration-500 ${
        card.status.toLowerCase() !== "available"
          ? "brightness-50 hover:brightness-50"
          : ""
      }`}
    >
      <CardHeader>
        <CardTitle className="text-xl">{card.title}</CardTitle>
        <CardDescription className="text-lg">
          {card.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <img
          src={card.image_url}
          alt={card.title}
          className="w-full h-auto max-h-[500px] object-contain rounded-lg mb-4"
        />
        <div className="mt-4 space-y-2">
          <div className="text-lg">
            <strong>Brand:</strong> {card.brand}
          </div>
          <div className="text-lg">
            <strong>Grade:</strong> {card.grade}
          </div>
          <div className="text-lg">
            <strong>Price:</strong>{" "}
            <span className="">
              ${Number.parseFloat(card.price).toLocaleString()}
            </span>
          </div>
          <div
            className={`text-lg ${
              card.status.toLowerCase() === "available"
                ? "text-success"
                : card.status.toLowerCase() === "sold"
                  ? "text-destructive"
                  : "text-muted-foreground"
            }`}
          >
            <strong>Status:</strong> {card.status.toUpperCase()}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div className="text-lg">
          <strong>Seller:</strong> {card.seller_name}
        </div>

        {card.status.toLowerCase() === "available" && (
          <Button
            className={`text-xl px-4 py-2 rounded-md ${isInCart(card.id) ? "bg-destructive text-destructive-foreground hover:bg-destructive" : "bg-success text-success-foreground hover:bg-success"}`}
            onClick={toggleCart}
          >
            {isInCart(card.id) ? "Remove from Cart" : "Add to Cart"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
