import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import createApolloClient from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { User } from "next-auth";
import { JWT } from "next-auth/jwt";

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
                    serial
                    company {
                        id
                        doc
                        percentageIgv
                        isEnabled
                    }
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
    subsidiarySerial: string;
    companyId: number;
    companyDoc: string;
    companyPercentageIgv: number;
    companyIsEnabled: boolean;
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials, req) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error(
                        "El correo y la contraseña son obligatorios."
                    );
                }
                const client = createApolloClient();
                try {
                    const values = {
                        email: credentials.email,
                        password: credentials.password,
                    };

                    const { data, errors } = await client.mutate({
                        mutation: TOKEN_AUTH_MUTATION,
                        variables: values,
                    });

                    // Manejamos errores de GraphQL "clásicos"
                    if (errors) {
                        // Extract the actual error message from the GraphQL error
                        const errorMessage = errors[0]?.message || "";
                        const cleanedMessage = errorMessage.replace(
                            "Error: ",
                            ""
                        );
                        throw new Error(cleanedMessage);
                    }

                    if (data.tokenAuth && data.tokenAuth.token) {
                        return {
                            id: data.tokenAuth.user.id,
                            fullName: data.tokenAuth.user.fullName,
                            email: data.tokenAuth.user.email,
                            avatar: data.tokenAuth.user.avatar,
                            isSuperuser: data.tokenAuth.user.isSuperuser,
                            accessToken: data.tokenAuth.token,
                            subsidiaryId: data.tokenAuth.user.subsidiary.id,
                            subsidiaryName: data.tokenAuth.user.subsidiary.name,
                            subsidiarySerial:
                                data.tokenAuth.user.subsidiary.serial,
                            companyId:
                                data.tokenAuth.user.subsidiary.company.id,
                            companyDoc:
                                data.tokenAuth.user.subsidiary.company.doc,
                            companyPercentageIgv:
                                data.tokenAuth.user.subsidiary.company
                                    .percentageIgv,
                            companyIsEnabled:
                                data.tokenAuth.user.subsidiary.company
                                    .isEnabled,
                            exp: data.tokenAuth?.payload.exp,
                            iat: data.tokenAuth?.payload.origIat,
                        };
                    } else {
                        throw new Error("Autenticación fallida.");
                    }
                } catch (error: any) {
                    // Preserve the original error message
                    throw error instanceof Error
                        ? error
                        : new Error(error?.message || "Autenticación fallida.");
                }
            },
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 365 * 24 * 60 * 60,
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user: User }) {
            if (user) {
                token.user = user as ExtendedUser;
                token.accessToken = (user as ExtendedUser).accessToken;
                token.iat = (user as ExtendedUser).iat;
                token.exp = (user as ExtendedUser).exp;
                token.fullName = (user as ExtendedUser).fullName;
                token.avatar = (user as ExtendedUser).avatar;
                token.isSuperuser = (user as ExtendedUser).isSuperuser;
                token.subsidiaryId = (user as ExtendedUser).subsidiaryId;
                token.subsidiaryName = (user as ExtendedUser).subsidiaryName;
                token.subsidiarySerial = (
                    user as ExtendedUser
                ).subsidiarySerial;
                token.companyId = (user as ExtendedUser).companyId;
                token.companyDoc = (user as ExtendedUser).companyDoc;
                token.companyPercentageIgv = (
                    user as ExtendedUser
                ).companyPercentageIgv;
                token.companyIsEnabled = (
                    user as ExtendedUser
                ).companyIsEnabled;
            }
            return token;
        },
        async session({ session, token }: { session: any; token: JWT }) {
            return {
                ...session,
                user: {
                    id: token.sub,
                    fullName: token.fullName,
                    email: token.email,
                    avatar: token.avatar,
                    isSuperuser: token.isSuperuser,
                    subsidiaryId: token.subsidiaryId,
                    subsidiaryName: token.subsidiaryName,
                    subsidiarySerial: token.subsidiarySerial,
                    companyId: token.companyId,
                    companyDoc: token.companyDoc,
                    companyPercentageIgv: token.companyPercentageIgv,
                    companyIsEnabled: token.companyIsEnabled,
                },
                accessToken: token.accessToken,
                expires: new Date((token.exp as number) * 1000).toISOString(),
            };
        },
        async redirect({ url, baseUrl }) {
            // console.log("baseUrl", baseUrl);
            return baseUrl;
        },
    },
    pages: {
        signIn: "/login",
        signOut: "/custom-signout",
    },
};
