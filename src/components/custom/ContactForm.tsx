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
  name: z.string().min(2, "Le nom doit comporter au moins 2 caractères."),
  number: z.string().min(5, "Le numéro de téléphone semble trop court.").regex(/^\+?[0-9\s\-()]+$/, "Format du numéro de téléphone invalide."),
  email: z.string().email("Adresse email invalide.").optional().or(z.literal('')),
  avatarUrl: z.string().url("Format d'URL invalide.").optional().or(z.literal('')),
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
        <DialogTitle>{initialData?.id ? "Modifier le Contact" : "Ajouter un Nouveau Contact"}</DialogTitle>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Jean Dupont" {...field} />
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
                <FormLabel>Numéro de Téléphone</FormLabel>
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
                <FormLabel>Email (Optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="jean.dupont@example.com" {...field} />
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
                <FormLabel>URL de l'Avatar (Optionnel)</FormLabel>
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
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              {initialData?.id ? "Enregistrer les Modifications" : "Ajouter le Contact"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
