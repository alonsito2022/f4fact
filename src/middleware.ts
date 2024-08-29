export {default} from 'next-auth/middleware'
import { NextResponse } from "next/server";
import NextAuth from "next-auth";


export const config = {
  matcher: ['/dashboard/:path*'],
}