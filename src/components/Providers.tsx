/**
 * Providers wrapper — required to use useSession() in Client Components.
 * Must wrap the app in a "use client" boundary.
 */
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
    return <SessionProvider>{children}</SessionProvider>;
}
