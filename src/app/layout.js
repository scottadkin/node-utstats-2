import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "./UI/Nav";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Node UTStats 2",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Nav params={{}}/>
        {children}
        <footer>Horse Noise</footer>
      </body>
    </html>
  );
}