import Navbar from "@/components/custom/Navbar";
import { Outlet } from "react-router";

export default function Layout() {
  return (
    <div className="flex w-full flex-col overflow-hidden">
      <Navbar />

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8 mt-4">
        <Outlet />
      </main>
    </div>
  );
}
