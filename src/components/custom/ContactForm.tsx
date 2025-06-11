"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import type { Contact } from "@/lib/types";
import { DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  number: z.string().min(5, "Phone number seems too short.").regex(/^\+?[0-9\s\-()]+$/, "Invalid phone number format."),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  avatarUrl: z.string().url("Invalid URL format.").optional().or(z.literal('')),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  onSubmit: (data: ContactFormValues) => void;
  initialData?: Partial<Contact>;
  onClose: () => void;
}

export function ContactForm({ onSubmit, initialData, onClose }: ContactFormProps) {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      number: initialData?.number || "",
      email: initialData?.email || "",
      avatarUrl: initialData?.avatarUrl || "",
    },
  });

  const handleSubmit = (data: ContactFormValues) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <DialogContent className="sm:max-w-[425px] bg-card">
      <DialogHeader>
        <DialogTitle>{initialData?.id ? "Edit Contact" : "Add New Contact"}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1-555-123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="avatarUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Avatar URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://example.com/avatar.png" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {initialData?.id ? "Save Changes" : "Add Contact"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
