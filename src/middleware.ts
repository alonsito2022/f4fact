import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    // Aquí puedes verificar si el token ha expirado
    if (token && token.expires && new Date() > new Date(Number(token.expires))) {
        return NextResponse.redirect('/auth/login'); // Redirige a la página de login si la sesión ha expirado
    }
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*'],
}