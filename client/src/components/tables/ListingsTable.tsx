import CreateListingForm from "@/components/forms/CreateListingForm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fetchRequest } from "@/lib/fetch";
import { Card as CardType } from "@/lib/types";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ListingsTable({ cards }: { cards: CardType[] }) {
  const [isDialogOpen, setDialogOpen] = useState(false);

  const handleActionClick = async (method: string, cardId: string) => {
    const cardActionRequest = fetchRequest({
      url: `http://localhost:8080/api/cards/${cardId}`,
      method: method,
    });

    toast.promise(cardActionRequest, {
      loading: "Loading...",
      success: async (response) => {
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Still working
        return `${response.success.message}`;
      },
      error: (response) => {
        return `${response.error.message}`;
      },
    });
  };

  return (
    <Card className="animate-in">
      <CardHeader className="flex flex-row justify-between">
        <CardDescription className="text-xl">Manage Listings</CardDescription>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="default"
                className="text-lg"
                onClick={() => setDialogOpen(true)}
              >
                Create Listing
              </Button>
            </DialogTrigger>

            <DialogContent>
              <CreateListingForm />
            </DialogContent>
          </Dialog>
        </div>
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
              <TableHead className="text-lg">Status</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cards.length > 0 ? (
              cards.map((card) => (
                <TableRow key={card.id}>
                  <TableCell className="hidden sm:table-cell">
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="w-full h-auto max-h-[650px] object-contain rounded-lg mb-4"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-xl">
                    {card.title}
                  </TableCell>
                  <TableCell className="text-xl">{card.brand}</TableCell>
                  <TableCell className="text-xl">
                    ${Number.parseFloat(card.price).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        card.status === "sold"
                          ? "destructive"
                          : card.status === "available"
                            ? "primary"
                            : "secondary"
                      }
                      className="text-md text-center"
                    >
                      {card.status.charAt(0).toUpperCase() +
                        card.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {card.status !== "sold" && (
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
                          {card.status === "available" ? (
                            <DropdownMenuItem
                              className="text-lg cursor-pointer outline-0"
                              onClick={() =>
                                handleActionClick("DELETE", card.id)
                              }
                            >
                              Unlist
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="text-lg cursor-pointer outline-0"
                              onClick={() => handleActionClick("POST", card.id)}
                            >
                              Relist
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground text-lg"
                >
                  No listings found
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
