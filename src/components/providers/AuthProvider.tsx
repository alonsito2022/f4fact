"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { IUser } from "@/app/types";

interface AuthContextType {
    user: IUser | null;
    jwtToken: string | null;
    status: "authenticated" | "unauthenticated" | "loading";
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    return useContext(AuthContext);
}

function AuthContextBridge({ children }: { children: React.ReactNode }) {
    // useSession() se revalida en foco/reconexion y en cada refetchInterval,
    // por lo que aqui siempre llega el accessToken ya renovado por el
    // callback jwt de NextAuth (ver authOptions.ts).
    const { data: session, status: sessionStatus } = useSession();
    const hasRefreshError = (session as any)?.error === "RefreshAccessTokenError";

    useEffect(() => {
        if (hasRefreshError) {
            signOut({ callbackUrl: "/login" });
        }
    }, [hasRefreshError]);

    const user = session && !hasRefreshError ? ((session as any).user as IUser) : null;
    const jwtToken = session && !hasRefreshError ? ((session as any).accessToken as string) : null;
    const status: AuthContextType["status"] = hasRefreshError ? "unauthenticated" : sessionStatus;

    const contextValue = useMemo(
        () => ({ user, jwtToken, status }),
        [user, jwtToken, status]
    );

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}

export default function AuthProvider({
    session,
    children,
}: {
    session: Session | null;
    children: React.ReactNode;
}) {
    return (
        <SessionProvider session={session} refetchInterval={5 * 60}>
            <AuthContextBridge>{children}</AuthContextBridge>
        </SessionProvider>
    );
}
