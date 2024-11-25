import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { CircleUser, Menu, Package2, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export default function Navbar() {
  const { cart, clearCart } = useCart();
  let { isAuthenticated, name, logOut, checkAuth } = useAuth();
  const location = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      await checkAuth();
    };
    checkAuthentication();
  }, [checkAuth]);

  const currentPath = location.pathname;

  const links = ["/listings", "/orders", "/transactions"];

  return (
    <header className="bg-background sticky top-0 flex h-20 justify-between items-center border-b px-4 md:px-6 animate-in">
      <div className="flex items-center gap-6">
        <a
          href="/"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-8 w-8 mr-5" />
          <span className="text-2xl mx-5">Card Shop</span>
        </a>
      </div>

      <div className="flex items-center gap-6 ml-5">
        {isAuthenticated ? (
          <>
            <nav className="hidden flex-col gap-6 text-xl font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-xl lg:gap-6">
              <a
                href="/"
                className={`transition-colors ${currentPath === "/" ? "text-foreground font-bold" : "text-muted-foreground"} hover:text-foreground`}
              >
                Home
              </a>
              {links.map((path) => (
                <a
                  key={path}
                  href={path}
                  className={`transition-colors ${
                    currentPath === path
                      ? "text-foreground font-bold"
                      : "text-muted-foreground"
                  } hover:text-foreground`}
                >
                  {path.split("/").pop()!.charAt(0).toUpperCase() +
                    path.split("/").pop()!.slice(1)}
                </a>
              ))}
            </nav>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full ml-5"
                >
                  <CircleUser className="h-8 w-8" />
                  <span className="sr-only">Toggle user menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="text-lg font-semibold">
                  {name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-md"
                  onClick={async () => await logOut()}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Button variant="default" className="text-lg">
            <Link to={"/auth/sign-in"}>Sign In</Link>
          </Button>
        )}

        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative cursor-pointer">
                <ShoppingCart size={25} className="mr-5" />
                {cart.length !== 0 && (
                  <Badge className="absolute top-[-10px] left-5 bg-destructive text-foreground text-xs rounded-full px-2 py-1 hover:bg-destructive">
                    {cart.length}
                  </Badge>
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <div className="p-4 w-80">
                {cart.length > 0 ? (
                  <>
                    <p className="text-center text-lg text-muted-foreground">
                      You have {cart.length} item{cart.length > 1 ? "s" : ""} in
                      your cart.
                    </p>
                    <Button variant="default" className="mt-4 w-full text-md">
                      <Link to="/checkout">Proceed to Checkout</Link>
                    </Button>
                    <Button
                      variant="default"
                      className="mt-4 w-full text-md bg-destructive text-destructive-foreground hover:bg-destructive hover:brightness-125"
                      onClick={() => clearCart()}
                    >
                      Clear Cart
                    </Button>
                  </>
                ) : (
                  <p className="text-center text-md text-muted-foreground">
                    Your cart is empty.
                  </p>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isAuthenticated && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="grid gap-6 text-xl font-medium">
                <SheetClose asChild>
                  <a
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <Package2 className="h-8 w-8" />
                    <span className="text-2xl ml-5">Card Shop</span>
                  </a>
                </SheetClose>
                <a
                  href="/"
                  className={`transition-colors ${currentPath === "/" ? "text-foreground font-bold" : "text-muted-foreground"} hover:text-foreground`}
                >
                  Home
                </a>
                {links.map((path) => (
                  <SheetClose asChild key={path}>
                    <a
                      href={path}
                      className={`transition-colors ${
                        currentPath === path
                          ? "text-foreground font-bold"
                          : "text-muted-foreground"
                      } hover:text-foreground`}
                    >
                      {path.split("/").pop()!.charAt(0).toUpperCase() +
                        path.split("/").pop()!.slice(1)}
                    </a>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
}
