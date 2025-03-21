import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Karla as FontSans } from "next/font/google";
import { type Metadata } from "next";
import NextTopLoader from "nextjs-toploader";
import QueryProvider from "~/components/QueryProvider";

export const metadata: Metadata = {
  title: "Sodexo Storage",
  description: "Sodexo Storage Management",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const fontSans = FontSans({
  weight: ["200", "300", "400", "500", "600", "700", "800"],
  style: "normal",
  variable: "--font-karla",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${fontSans.variable} --font-karla dark w-screen overflow-x-hidden`}
      >
        <body>
          <QueryProvider>
            <NextTopLoader />
            {children}
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
