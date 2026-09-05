"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const TOPIC_VALUES = ["general", "orders", "bulk", "feedback"] as const;

const TOPICS = [
  { value: "general", label: "General enquiry" },
  { value: "orders", label: "Orders & delivery" },
  { value: "bulk", label: "Bulk & gifting" },
  { value: "feedback", label: "Feedback" },
] as const;

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^[+()\-.\s\d]{7,16}$/.test(value),
      "Enter a valid phone number.",
    ),
  topic: z.enum(TOPIC_VALUES, { message: "Please choose a topic." }),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters.")
    .max(1000, "Message must be 1000 characters or fewer."),
});

type Values = z.infer<typeof contactSchema>;

/**
 * Customer-facing contact form. Validates on the client with react-hook-form +
 * zod and shows a calm confirmation on submit. Server-rendered page, small
 * client leaf component only.
 */
export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [topic, setTopic] = useState<Values["topic"]>("general");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", topic: "general", message: "" },
  });

  function onSubmit() {
    // No message backend on this preview build — confirm courteously.
    setSent(true);
    setTopic("general");
    reset({ name: "", email: "", phone: "", topic: "general", message: "" });
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex min-h-[26rem] flex-col items-center justify-center gap-4 rounded-2xl border bg-card p-8 text-center shadow-card"
      >
        <div className="order-success-pop flex size-14 items-center justify-center rounded-full bg-[oklch(0.72_0.15_75/0.18)] text-[oklch(0.55_0.12_55)]">
          <CheckCircle2 className="size-7" aria-hidden="true" />
        </div>
        <h3 className="font-heading text-xl font-bold tracking-tight">
          Thank you — message received
        </h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          We&apos;ll get back to you within one working day. For anything urgent,
          call us on +91 98765 43210.
        </p>
        <Button
          type="button"
          variant="outline"
          className="store-hover-lift rounded-xl text-foreground"
          onClick={() => setSent(false)}
        >
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="contact-name" required>
            Name
          </FieldLabel>
          <FieldContent>
            <Input
              id="contact-name"
              autoComplete="name"
              placeholder="Your name"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              {...register("name")}
            />
            {errors.name && (
              <FieldError
                id="contact-name-error"
                errors={[{ message: errors.name.message }]}
              />
            )}
          </FieldContent>
        </Field>

        <Field>
          <FieldLabel htmlFor="contact-phone">Phone (optional)</FieldLabel>
          <FieldContent>
            <Input
              id="contact-phone"
              type="tel"
              autoComplete="tel"
              placeholder="+91 …"
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "contact-phone-error" : undefined}
              {...register("phone")}
            />
            {errors.phone && (
              <FieldError
                id="contact-phone-error"
                errors={[{ message: errors.phone.message }]}
              />
            )}
          </FieldContent>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="contact-email" required>
          Email
        </FieldLabel>
        <FieldContent>
          <Input
            id="contact-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <FieldError
              id="contact-email-error"
              errors={[{ message: errors.email.message }]}
            />
          )}
        </FieldContent>
      </Field>

      <Field>
        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-1 text-sm font-medium text-foreground">
            What&apos;s this about? <span className="text-destructive">*</span>
          </legend>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((item) => {
              const selected = topic === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setTopic(item.value);
                    setValue("topic", item.value, { shouldValidate: true });
                  }}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    selected
                      ? "border-transparent bg-[oklch(0.42_0.09_45)] text-[oklch(0.98_0.015_85)] shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:border-[oklch(0.72_0.15_75/0.4)] hover:text-foreground"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <input type="hidden" {...register("topic")} />
          {errors.topic && (
            <FieldError
              id="contact-topic-error"
              errors={[{ message: errors.topic.message }]}
            />
          )}
        </fieldset>
      </Field>

      <Field>
        <FieldLabel htmlFor="contact-message" required>
          Message
        </FieldLabel>
        <FieldContent>
          <Textarea
            id="contact-message"
            rows={5}
            placeholder="Tell us a little about what you need…"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            {...register("message")}
          />
          {errors.message && (
            <FieldError
              id="contact-message-error"
              errors={[{ message: errors.message.message }]}
            />
          )}
        </FieldContent>
      </Field>

      <Button
        type="submit"
        size="lg"
        className="store-hover-lift h-12 rounded-xl px-6 text-base shadow-cta"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : (
          <Send className="size-4" aria-hidden="true" />
        )}
        Send message
      </Button>

      <p className="text-xs text-muted-foreground">
        We usually reply within one working day. Your details are only used to
        answer your enquiry.
      </p>
    </form>
  );
}