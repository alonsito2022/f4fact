"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { SessionProvider, useSession } from "next-auth/react";
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

export default function AuthProvider({
    session,
    children,
}: {
    session: Session | null;
    children: React.ReactNode;
}) {
    const [user, setUser] = useState<IUser | null>(null);
    const [jwtToken, setJwtToken] = useState<string | null>(null);
    const [status, setStatus] = useState<
        "authenticated" | "unauthenticated" | "loading"
    >("loading");
    useEffect(() => {
        if (session) {
            const { user: userData, accessToken } = session as Session & {
                accessToken: string;
            };
            setUser(userData as IUser);
            setJwtToken(accessToken || null);
            setStatus("authenticated");
        } else {
            setStatus("unauthenticated");
        }
    }, [session]);
    // useEffect(() => {
    //     // Obtén sesión actualizada
    //     if (status === "authenticated" && session) {
    //         setUser(session.user as IUser);
    //         setJwtToken((session?.user as IUser).accessToken || null);
    //         setStatus("authenticated");
    //     } else if (status === "unauthenticated") {
    //         setUser(null);
    //         setJwtToken(null);
    //         setStatus("unauthenticated");
    //     }
    // }, [sessionUseSession, statusUseSession]); // <-- Este cambio es clave
    const contextValue = useMemo(
        () => ({ user, jwtToken, status }),
        [user, jwtToken, status, session]
    );

    return (
        <SessionProvider session={session}>
            <AuthContext.Provider value={contextValue}>
                {children}
            </AuthContext.Provider>
        </SessionProvider>
    );
}
