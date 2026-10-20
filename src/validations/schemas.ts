import * as z from "zod";
import { NOTE_MAX_LENGTH, WISH_MAX_LENGTH } from "../config/constants";

export type TranslateFn = (key: string, options?: Record<string, any>) => string;

export const getRsvpSchema = (t: TranslateFn) => z.object({
  name: z.string().min(3, { message: t('form.missingNameMessage') }),
  phone: z.string().optional(),
  attendance: z.string(),
  personCount: z.string().optional(),
  side: z.string().optional(),
  hasChild: z.string().optional(),
  songRequest: z.string().max(100).optional(),
  note: z.string().max(NOTE_MAX_LENGTH).optional(),
  honeypot: z.string().optional()
});

export const getWishSchema = (t: TranslateFn) => z.object({
  name: z.string().min(2, { message: t('form.missingNameMessage') }),
  message: z.string().min(5, { message: t('form.missingWishMessage') }).max(WISH_MAX_LENGTH),
  honeypot: z.string().optional()
});

export type RsvpFormValues = z.infer<ReturnType<typeof getRsvpSchema>>;
export type WishFormValues = z.infer<ReturnType<typeof getWishSchema>>;