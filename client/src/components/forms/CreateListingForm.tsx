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
import { fetchRequest } from "@/lib/fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const cardListingSchema = z.object({
  brand: z
    .string()
    .min(1, { message: "Brand is required" })
    .max(50, { message: "Brand must be less than 50 characters" }),
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(255, { message: "Title must be less than 255 characters" }),
  description: z
    .string()
    .max(255, { message: "Description must be less than 255 characters" }),
  grade: z
    .string()
    .min(1, { message: "Grade is required" })
    .max(50, { message: "Grade must be less than 50 characters" }),
  price: z.string().regex(/^(?:\d+(\.\d{1,2})?)$/, {
    message: "Price must be a positive number with up to two decimal places",
  }),
  image_url: z.string().url({ message: "Invalid image URL" }),
});

export default function CreateListingForm() {
  const form = useForm<z.infer<typeof cardListingSchema>>({
    resolver: zodResolver(cardListingSchema),
    defaultValues: {
      brand: "",
      title: "",
      description: "",
      grade: "",
      price: "",
      image_url: "",
    },
  });

  async function onSubmit(formData: z.infer<typeof cardListingSchema>) {
    const createListingRequest = fetchRequest({
      url: "http://localhost:8080/api/cards",
      method: "POST",
      requestBody: formData,
    });

    toast.promise(createListingRequest, {
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
  }

  return (
    <div className="flex w-full items-center justify-center px-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col w-full justify-center gap-2 text-foreground [&>input]:mb-6 max-w-lg p-4"
        >
          <div className="space-y-6">
            <h1 className="text-4xl font-bold mb-4">
              Create a New Card Listing
            </h1>

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-2xl">Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Card Title" required {...field} />
                  </FormControl>
                  <FormMessage className="text-md pt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-2xl">Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="Card Brand" required {...field} />
                  </FormControl>
                  <FormMessage className="text-md pt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-2xl">Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief Description" {...field} />
                  </FormControl>
                  <FormMessage className="text-md pt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-2xl">Grade</FormLabel>
                  <FormControl>
                    <Input placeholder="Card Grade" required {...field} />
                  </FormControl>
                  <FormMessage className="text-md pt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-2xl">Price</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Card Price"
                      type="number"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-md pt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-2xl">Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Image URL" required {...field} />
                  </FormControl>
                  <FormMessage className="text-md pt-2" />
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
                "Submit"
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
