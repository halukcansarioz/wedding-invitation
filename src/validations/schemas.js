import * as z from "zod";
import { NOTE_MAX_LENGTH, WISH_MAX_LENGTH } from "../config/constants";

export const getRsvpSchema = (t) => z.object({
  name: z.string().min(3, { message: t('form.missingNameMessage') }),
  attendance: z.string(),
  songRequest: z.string().max(100).optional(),
  note: z.string().max(NOTE_MAX_LENGTH).optional(),
  honeypot: z.string().optional()
});

export const getWishSchema = (t) => z.object({
  name: z.string().min(2, { message: t('form.missingNameMessage') }),
  message: z.string().min(5, { message: t('form.missingWishMessage') }).max(WISH_MAX_LENGTH),
  honeypot: z.string().optional()
});