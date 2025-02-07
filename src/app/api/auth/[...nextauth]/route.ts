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
    iat: number;
    exp: number;
}

interface ExtendedSession extends Session {
    iat: number;
    exp: number;
}

const handler = NextAuth({
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
                        console.log("payload", data.tokenAuth);
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
                // let queryfecth = `
                //     mutation {
                //         tokenAuth(email: "${credentials?.email}", password: "${credentials?.password}") {
                //             token
                //             payload
                //             refreshToken
                //             refreshExpiresIn
                //             user{
                //                 id
                //                 username
                //                 fullName
                //                 avatar
                //                 avatarUrl
                //             }
                //         }
                //     }
                // `;
                // const apiUserResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                //     method: 'POST',
                //     headers: { "Content-Type": "application/json" },
                //     body: JSON.stringify({
                //         query: queryfecth
                //     })
                // });
                // const data: any = await apiUserResponse.json();
                // console.log("data", data.data.tokenAuth.user)
                // // If no error and we have user data, return it
                // if (apiUserResponse.ok && data) {
                //     const user = {
                //         "id": data.data.tokenAuth.user.id,
                //         "username": data.data.tokenAuth.user.username,
                //         "fullName": data.data.tokenAuth.user.fullName,
                //         "email": data.data.tokenAuth.payload.email,
                //         "avatar": data.data.tokenAuth.user.avatar,
                //         // "avatarUrl": data.data.tokenAuth.user.avatarUrl,
                //         "refreshToken": data.data.tokenAuth.refreshToken,
                //         "accessToken": data.data.tokenAuth.token,
                //         "exp": data.data.tokenAuth?.payload.exp,
                //         "origIat": data.data.tokenAuth?.payload.origIat
                //     }
                //     return user
                // }
                // // Return null if user data could not be retrieved
                // return null
            },
        }),
    ],
    session: {
        strategy: "jwt",
        // maxAge: 5 * 60, // 5 minutos en segundos
        maxAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        async jwt({ token, user }: { token: JWT; user: User }) {
            const usr = user as ExtendedUser;
            if (usr) {
                token.user = usr;
                token.iat = usr.iat;
                token.exp = usr.exp;
            }
            return token;
        },
        async session({ session, token }: { session: Session; token: JWT }) {
            // const ses = session as ExtendedSession;
            // console.log("expires", session.expires)
            // if (token.exp){
            //     // Convertir el tiempo UNIX a ISODateString
            //     const expiresAt = new Date(Number(token.exp) * 1000).toISOString();
            //     session.expires = expiresAt; // Asignar nueva fecha de expiración
            // }
            // console.log("expires 2", session.expires)
            session.user = token.user as ExtendedUser;
            // ses.ag = Number(token.iat)
            // ses.exp = Number(token.exp)
            // session.accessToken = token.user.accessToken as any;
            return session;
        },
    },
    pages: {
        signIn: "/login",
        // signOut:`/`,
    },
    // redirect:{
    //     signOut: `/`
    // }
    // events: {
    //     signOut: `${process.env.NEXTAUTH_URL_INTERNAL}/`,
    //     // signOut(message) {

    //     // },(){

    //     //     return `${process.env.NEXTAUTH_URL_INTERNAL}/`;
    //     // },
    // }
});

export { handler as GET, handler as POST };
