import { Card } from "@/lib/types";
import { ChevronDown, Search } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";

export default function SearchBar({
  searchTerm,
  setSearchTerm,
  filter,
  setFilter,
  priceRanges,
  setPriceRange,
  cards,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: string;
  setFilter: (filter: string) => void;
  priceRanges: { label: string; min: number; max: number }[];
  setPriceRange: (min: number, max: number) => void;
  cards: Card[];
}) {
  const getCardCountInRange = (min: number, max: number) => {
    return cards.filter(
      (card) =>
        Number.parseFloat(card.price) >= min &&
        Number.parseFloat(card.price) <= max,
    ).length;
  };

  return (
    <div className="flex justify-center items-center gap-4 flex-wrap max-w-full mx-auto">
      <div className="relative flex items-center w-full max-w-3xl">
        <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
        <Input
          type="search"
          name="search"
          placeholder="Search..."
          className="pl-8 sm:w-[400px] md:w-[500px] lg:w-[700px] w-full text-lg placeholder:text-lg bg-muted"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="ml-2 text-lg bg-muted px-4 py-2 rounded-md"
            >
              {filter.toUpperCase()}
              <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            <DropdownMenuLabel className="text-xl">
              Filter Options
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xl"
              onSelect={() => setFilter("title")}
            >
              Title
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xl"
              onSelect={() => setFilter("brand")}
            >
              Brand
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xl"
              onSelect={() => setFilter("grade")}
            >
              Grade
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xl"
              onSelect={() => setFilter("status")}
            >
              Status
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="ml-2 text-lg bg-muted px-4 py-2 rounded-md"
          >
            Filter by Price
            <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          <DropdownMenuLabel className="text-xl">Price Range</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {priceRanges.map((range) => (
            <DropdownMenuItem
              key={range.label}
              className="text-xl"
              onSelect={() => setPriceRange(range.min, range.max)}
            >
              {range.label} - {getCardCountInRange(range.min, range.max)} item
              {getCardCountInRange(range.min, range.max) !== 1 ? "s" : ""}
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            className="text-xl text-destructive"
            onSelect={() => setPriceRange(0, Number.POSITIVE_INFINITY)}
          >
            Reset Price Filter
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
