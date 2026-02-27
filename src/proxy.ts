/**
 * Middleware: Protects the /dashboard route.
 * Unauthenticated users are redirected to the home page.
 */
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: unknown }) => {
    const { pathname } = req.nextUrl;

    // If user is not signed in and tries to access any /dashboard route
    if (pathname.startsWith("/dashboard") && !req.auth) {
        const loginUrl = new URL("/", req.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }
});

export const config = {
    matcher: ["/dashboard/:path*"],
};
