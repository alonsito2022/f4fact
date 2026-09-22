import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import createApolloClient from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { User } from "next-auth";
import { JWT } from "next-auth/jwt";

const REFRESH_TOKEN_MUTATION = gql`
  mutation ($refreshToken: String!) {
    customRefreshToken(refreshToken: $refreshToken) {
      success
      message
      token
      refreshToken
      refreshExpiresIn
    }
  }
`;

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
            businessName
            doc
            percentageIgv
            isEnabled
            includeIgv
            withStock
            invoiceF
            invoiceB
            guide
            catalog
            app
            isProduction
            disableContinuePay
            showUser
          }
        }
      }
    }
  }
`;

interface ExtendedUser extends User {
  accessToken: string;
  refreshToken: string;
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
  companyName: string;
  companyPercentageIgv: number;
  companyIsEnabled: boolean;

  companyIncludeIgv: boolean;
  companyWithStock: boolean;
  companyInvoiceF: boolean;
  companyInvoiceB: boolean;
  companyGuide: boolean;
  companyCatalog: boolean;
  companyApp: boolean;
  companyDisableContinuePay: boolean;
  companyIsProduction: boolean;
  companyShowUser: boolean;
}

function decodeJwt(jwtToken: string): { exp: number; origIat?: number } {
  const payload = jwtToken.split(".")[1];
  return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
}

const REFRESH_BUFFER_SECONDS = 5 * 60;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const client = createApolloClient();
    const { data, errors } = await client.mutate({
      mutation: REFRESH_TOKEN_MUTATION,
      variables: { refreshToken: token.refreshToken },
    });

    if (errors || !data?.customRefreshToken?.success) {
      throw new Error(
        data?.customRefreshToken?.message || "No se pudo renovar la sesión."
      );
    }

    const refreshed = data.customRefreshToken;
    const payload = decodeJwt(refreshed.token);

    return {
      ...token,
      accessToken: refreshed.token,
      refreshToken: refreshed.refreshToken,
      exp: payload.exp,
      iat: payload.origIat,
      error: undefined,
    };
  } catch (error) {
    console.error("Error al renovar el access token:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
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
          throw new Error("El correo y la contraseña son obligatorios.");
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
            const cleanedMessage = errorMessage.replace("Error: ", "");
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
              refreshToken: data.tokenAuth.refreshToken,
              subsidiaryId: data.tokenAuth.user.subsidiary.id,
              subsidiaryName: data.tokenAuth.user.subsidiary.name,
              subsidiarySerial: data.tokenAuth.user.subsidiary.serial,
              companyId: data.tokenAuth.user.subsidiary.company.id,
              companyDoc: data.tokenAuth.user.subsidiary.company.doc,
              companyName: data.tokenAuth.user.subsidiary.company.businessName,
              companyPercentageIgv:
                data.tokenAuth.user.subsidiary.company.percentageIgv,
              companyIsEnabled:
                data.tokenAuth.user.subsidiary.company.isEnabled,

              companyIncludeIgv:
                data.tokenAuth.user.subsidiary.company.includeIgv,

              companyWithStock:
                data.tokenAuth.user.subsidiary.company.withStock,

              companyInvoiceF: data.tokenAuth.user.subsidiary.company.invoiceF,

              companyInvoiceB: data.tokenAuth.user.subsidiary.company.invoiceB,

              companyGuide: data.tokenAuth.user.subsidiary.company.guide,

              companyCatalog: data.tokenAuth.user.subsidiary.company.catalog,

              companyApp: data.tokenAuth.user.subsidiary.company.app,

              companyDisableContinuePay:
                data.tokenAuth.user.subsidiary.company.disableContinuePay,

              companyIsProduction:
                data.tokenAuth.user.subsidiary.company.isProduction,

              companyShowUser: data.tokenAuth.user.subsidiary.company.showUser,
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
        token.refreshToken = (user as ExtendedUser).refreshToken;
        token.iat = (user as ExtendedUser).iat;
        token.exp = (user as ExtendedUser).exp;
        token.error = undefined;
        token.fullName = (user as ExtendedUser).fullName;
        token.avatar = (user as ExtendedUser).avatar;
        token.isSuperuser = (user as ExtendedUser).isSuperuser;
        token.subsidiaryId = (user as ExtendedUser).subsidiaryId;
        token.subsidiaryName = (user as ExtendedUser).subsidiaryName;
        token.subsidiarySerial = (user as ExtendedUser).subsidiarySerial;
        token.companyId = (user as ExtendedUser).companyId;
        token.companyDoc = (user as ExtendedUser).companyDoc;
        token.companyName = (user as ExtendedUser).companyName;
        token.companyPercentageIgv = (
          user as ExtendedUser
        ).companyPercentageIgv;
        token.companyIsEnabled = (user as ExtendedUser).companyIsEnabled;
        token.companyIncludeIgv = (user as ExtendedUser).companyIncludeIgv;
        token.companyWithStock = (user as ExtendedUser).companyWithStock;
        token.companyInvoiceF = (user as ExtendedUser).companyInvoiceF;
        token.companyInvoiceB = (user as ExtendedUser).companyInvoiceB;
        token.companyGuide = (user as ExtendedUser).companyGuide;
        token.companyCatalog = (user as ExtendedUser).companyCatalog;
        token.companyApp = (user as ExtendedUser).companyApp;
        token.companyDisableContinuePay = (
          user as ExtendedUser
        ).companyDisableContinuePay;
        token.companyIsProduction = (user as ExtendedUser).companyIsProduction;
        token.companyShowUser = (user as ExtendedUser).companyShowUser;
        return token;
      }

      // Llamadas posteriores: renovar el access token de Django antes de que expire
      const expiresAt = typeof token.exp === "number" ? token.exp : 0;
      const shouldRefresh =
        Date.now() >= (expiresAt - REFRESH_BUFFER_SECONDS) * 1000;

      if (!shouldRefresh) {
        return token;
      }

      if (!token.refreshToken) {
        return { ...token, error: "RefreshAccessTokenError" };
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }: { session: any; token: JWT }) {
      return {
        ...session,
        error: token.error,
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
          companyName: token.companyName,
          companyPercentageIgv: token.companyPercentageIgv,
          companyIsEnabled: token.companyIsEnabled,
          companyIncludeIgv: token.companyIncludeIgv,
          companyWithStock: token.companyWithStock,
          companyInvoiceF: token.companyInvoiceF,
          companyInvoiceB: token.companyInvoiceB,
          companyGuide: token.companyGuide,
          companyCatalog: token.companyCatalog,
          companyApp: token.companyApp,
          companyDisableContinuePay: token.companyDisableContinuePay,
          companyIsProduction: token.companyIsProduction,
          companyShowUser: token.companyShowUser,
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
