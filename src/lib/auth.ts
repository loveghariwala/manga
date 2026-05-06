import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise, { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { ObjectId } from "mongodb";

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const db = await getDb();
        console.log(`🔐 Sign-in attempt: ${credentials.email}`);
        const user = await db.collection("users").findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordCorrect) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token, user, trigger, session }) => {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }

      // Handle manual updates
      if (trigger === "update" && session?.user) {
        token.name = session.user.name || token.name;
      }

      // Sync with database ONLY on refreshes (not during initial login)
      if (token.id && !user && trigger !== "update") {
        try {
          const db = await getDb();
          const dbUser = await db.collection("users").findOne({ _id: new ObjectId(token.id as string) });
          
          if (dbUser) {
            token.name = dbUser.name;
            // WE DO NOT STORE THE IMAGE IN THE TOKEN (it's too big for cookies!)
            console.log(`✅ Sync complete for: ${dbUser.name}`);
          }
        } catch (error) {
          console.error("📡 Sync Error:", error);
        }
      }

      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.id as string,
        name: token.name,
      },
    }),
  },
  pages: {
    signIn: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
