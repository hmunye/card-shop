import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import CheckOut from "./pages/CheckOut";
import Home from "./pages/Home";
import Listings from "./pages/Listings";
import Orders from "./pages/Orders";
import Transactions from "./pages/Transactions";
import SignIn from "./pages/auth/SignIn";
import SignUp from "./pages/auth/SignUp";
import Layout from "./pages/layout";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CartProvider>
      <Toaster richColors />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="listings" element={<Listings />} />
              <Route path="orders" element={<Orders />} />
              <Route path="transactions" element={<Transactions />} />
            </Route>
            <Route path="/auth/sign-in" element={<SignIn />} />
            <Route path="/auth/sign-up" element={<SignUp />} />
            <Route path="/checkout" element={<CheckOut />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </CartProvider>
  </StrictMode>,
);
