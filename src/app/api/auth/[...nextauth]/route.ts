import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from 'bcryptjs';


const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {

                let queryfecth = `
                    mutation {
                        tokenAuth(email: "${credentials?.email}", password: "${credentials?.password}") {
                            token
                            payload
                            refreshToken
                            refreshExpiresIn
                            user{
                                id
                                username
                                fullName
                                avatar
                                avatarUrl
                            }
                        }
                    }
                `;
                console.log(queryfecth)
                const apiUserResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/graphql`, {
                    method: 'POST',
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        query: queryfecth
                    })
                });

                const data: any = await apiUserResponse.json();

                console.log("data", data.data.tokenAuth.user)
                // If no error and we have user data, return it
                if (apiUserResponse.ok && data) {
                    const user = {
                        "id": data.data.tokenAuth.user.id,
                        "username": data.data.tokenAuth.user.username,
                        "fullName": data.data.tokenAuth.user.fullName,
                        "email": data.data.tokenAuth.payload.email,
                        "avatar": data.data.tokenAuth.user.avatar,
                        // "avatarUrl": data.data.tokenAuth.user.avatarUrl,
                        "refreshToken": data.data.tokenAuth.refreshToken,
                        "token": data.data.tokenAuth.token,
                        "exp": data.data.tokenAuth?.payload.exp,
                        "origIat": data.data.tokenAuth?.payload.origIat
                    }
                    return user
                }
                // Return null if user data could not be retrieved
                return null
            }
        })
    ],
    session: {
        strategy: "jwt",
        // maxAge: 5 * 60, // 5 minutos en segundos
        maxAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.user = user;
            }
            return token;
        },
        async session({ session, token }) {
            session.user = token.user as any;
            return session;
        }
    },
    pages: {
        signIn: '/login',
    }
})

export { handler as GET, handler as POST }