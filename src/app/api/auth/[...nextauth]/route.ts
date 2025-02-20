import NextAuth, { Session } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import createApolloClient from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { JWT } from "next-auth/jwt";
import { User } from "next-auth";

const TOKEN_AUTH_MUTATION = gql`
    mutation TokenAuth($email: String!, $password: String!) {
        tokenAuth(email: $email, password: $password) {
            token
            payload
            refreshToken
            refreshExpiresIn
            user {
                id
                username
                fullName
                email
                avatar
                isSuperuser
                subsidiary {
                    id
                    name
                }
            }
        }
    }
`;

interface ExtendedUser extends User {
    accessToken: string;
    iat: number;
    exp: number;
    fullName: string;
    avatar: string;
    isSuperuser: boolean;
    subsidiaryId: string;
    subsidiaryName: string;
}

interface ExtendedSession extends Session {
    accessToken: string;
    iat: number;
    exp: number;
    user: ExtendedUser;
}
export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Username and password are required");
                }
                const client = createApolloClient();
                try {
                    const values = {
                        email: credentials.email,
                        password: credentials.password,
                    };
                    // console.log(values)
                    const { data, errors } = await client.mutate({
                        mutation: TOKEN_AUTH_MUTATION,
                        variables: values,
                    });
                    if (errors) console.log(errors.toString());

                    if (data.tokenAuth && data.tokenAuth.token) {
                        // console.log("payload", data.tokenAuth);
                        return {
                            id: data.tokenAuth.user.id,
                            fullName: data.tokenAuth.user.fullName,
                            email: data.tokenAuth.user.email,
                            avatar: data.tokenAuth.user.avatar,
                            isSuperuser: data.tokenAuth.user.isSuperuser,
                            accessToken: data.tokenAuth.token,
                            subsidiaryId: data.tokenAuth.user.subsidiary.id,
                            subsidiaryName: data.tokenAuth.user.subsidiary.name,
                            // ... cualquier otro dato del usuario que quieras incluir
                            exp: data.tokenAuth?.payload.exp,
                            iat: data.tokenAuth?.payload.origIat,
                        };
                    } else {
                        throw new Error("Authentication failed");
                    }
                } catch (error) {
                    console.error("Auth error:", error);
                    throw new Error("Authentication failed");
                }
            },
        }),
    ],
    session: {
        strategy: "jwt" as const,
        // maxAge: 5 * 60, // 5 minutos en segundos
        maxAge: 365 * 24 * 60 * 60, // 1 año para que no caduque en NextAuth
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user: User }) {
            if (user) {
                token.user = user as ExtendedUser; // Guarda todos los datos en el token
                token.accessToken = (user as ExtendedUser).accessToken;
                token.iat = (user as ExtendedUser).iat;
                token.exp = (user as ExtendedUser).exp;
                token.fullName = (user as ExtendedUser).fullName;
                token.avatar = (user as ExtendedUser).avatar;
                token.isSuperuser = (user as ExtendedUser).isSuperuser;
                token.subsidiaryId = (user as ExtendedUser).subsidiaryId;
                token.subsidiaryName = (user as ExtendedUser).subsidiaryName;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            return {
                ...session,
                user: {
                    id: token.sub, // Asegurar que se pase el ID del usuario
                    fullName: token.fullName,
                    email: token.email,
                    avatar: token.avatar,
                    isSuperuser: token.isSuperuser,
                    subsidiaryId: token.subsidiaryId,
                    subsidiaryName: token.subsidiaryName,
                },
                accessToken: token.accessToken,
                expires: new Date((token.exp as number) * 1000).toISOString(),
            };
        },
    },
    pages: {
        signIn: "/login",
        signOut: "/custom-signout", // Página personalizada de cierre de sesión
    },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
