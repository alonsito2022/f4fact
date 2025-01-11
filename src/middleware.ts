import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { getToken, JWT } from "next-auth/jwt";

// export async function middleware(req: any) {
//     // console.log("req", req)
//     const token = process.env.NEXTAUTH_SECRET;
//     const { pathname } = req.nextUrl;
//     console.log("token", token)
//     console.log("pathname", pathname)

//     // Si el usuario no está autenticado y está intentando acceder a /dashboard, redirige al login
//     if (!token && pathname.startsWith("/dashboard")) {
//         console.log("codition 1")
//       return NextResponse.redirect(new URL("/api/auth/signin", req.url));
//     }

//     // Si el usuario está autenticado y está en la ruta raíz, redirige a /dashboard
//     if (token && pathname === "/") {
//         console.log("codition 2")
//       return NextResponse.redirect(new URL("/dashboard", req.url));
//     }

//     return NextResponse.next();
//   }

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token as JWT;
        const { pathname, host } = req.nextUrl;
        // console.log("token", token)
        // console.log("pathname", pathname)
        // console.log("host", host)

        // if (req.nextUrl.pathname === '/login' && req.session) {
        //     return NextResponse.redirect(new URL('/', req.url)); // Redirige al home si ya está autenticado
        // }
        // console.log("token.now", new Date());
        // console.log("token.iat", token.iat, new Date(Number(token.iat) * 1000));
        // console.log("token.exp", token.exp, new Date(Number(token.exp) * 1000));

        // Si el usuario está autenticado y está intentando acceder a /login, redirige a /dashboard
        if (token && pathname === "/login") {
            return NextResponse.redirect(new URL("/dashboard", req.url));
        }
        // Si el usuario está autenticado y está en la ruta raíz, redirige a /dashboard
        if (token && pathname === "/") {
            return NextResponse.redirect(new URL("/dashboard/sales", req.url));
        }

        // Aquí puedes verificar si el token ha expirado
        if (
            token &&
            token.expires &&
            new Date() > new Date(Number(token.expires))
        ) {
            return NextResponse.redirect("/auth/login"); // Redirige a la página de login si la sesión ha expirado
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
    //   {
    //     pages: {
    //       signIn: '/login' // Aquí indicas que '/login' es la página de inicio de sesión
    //     },
    //   }
);

export const config = {
    matcher: ["/", "/dashboard/:path*"],
};
