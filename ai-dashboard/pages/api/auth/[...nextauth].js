import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Prototyp: role lze načítat z DB nebo mapovat podle emailu
      session.user.role = session.user.email === 'admin@serviskol.cz' ? 'admin' : 'contributor';
      return session;
    },
  },
});
