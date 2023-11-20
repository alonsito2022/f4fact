import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from 'bcryptjs';


const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "jsmith" },
                password: { label: "Password", type: "password", placeholder: "******" }
            },
            async authorize(credentials, req) {

                const apiTokenResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/users/auth/login/`, {
                    method: 'POST',
                    body: JSON.stringify(credentials),
                    headers: { "Content-Type": "application/json" }
                });
                if(apiTokenResponse.status!==200) throw new Error("Invalid credentials");
                
                const tokenObtained = await apiTokenResponse.json()
                
                const apiUserResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/users/api/get_user/`, {
                    method: 'GET',
                    headers: {  Authorization: `Bearer ${tokenObtained?.access}`, "Content-Type": "application/json" }
                });
                const user = await apiUserResponse.json()
                console.log(user)
                // If no error and we have user data, return it
                if (apiUserResponse.ok && user) {
                    return user
                }
                // Return null if user data could not be retrieved
                return null
            }
        })
    ],
    callbacks: {
        jwt({ account, token, user, profile, session }) {
          if(user) token.user=user;
          return token;
        },
        session({ session, token }) {

            session.user = token.user as any;
            return session
           
        }
    },
    pages: {
        signIn: '/login',
    }
})

export { handler as GET, handler as POST }