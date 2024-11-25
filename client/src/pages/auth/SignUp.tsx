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
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { z } from "zod";

const signUpSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignUp() {
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(formData: z.infer<typeof signUpSchema>) {
    setErrorMessage("");

    const response = await fetchRequest({
      url: "http://localhost:8080/api/auth/signup",
      method: "POST",
      requestBody: {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      },
    });

    if (response.error) {
      setErrorMessage(response.error.message);
      return;
    }

    navigate("/");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <div className="absolute top-10 left-10">
        <Button className="relative text-xl">
          <Link to="/" className="flex justify-center items-center gap-2">
            <ChevronLeft />
            Back
          </Link>
        </Button>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col w-screen justify-center gap-2 text-foreground [&>input]:mb-6 max-w-lg p-4 animate-in"
        >
          <div className="flex flex-col gap-10 [&>input]:mb-4 mt-8 rounded-lg p-8 py-16 border">
            <h1 className="text-4xl font-bold mb-4">Sign Up</h1>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-2xl">Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" required {...field} />
                  </FormControl>
                  <FormMessage className="text-md pt-2" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-2xl">Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@example.com"
                      type="email"
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-2xl">Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="*********"
                      type="password"
                      required
                      {...field}
                    />
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

            {errorMessage && (
              <div className="text-md font-medium text-destructive">
                Error: {errorMessage}
              </div>
            )}

            <div className="mt-4 text-center text-xl">
              <span>Already have an account? </span>
              <Link to="/auth/sign-in" className="underline font-medium">
                Sign in
              </Link>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
