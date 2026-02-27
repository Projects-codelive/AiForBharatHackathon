/**
 * NextAuth route handler — re-exports GET and POST from auth config.
 */
import { handlers } from "@/lib/auth";

export const { GET, POST } = handlers;
