import "../../styles/globals.css";
import Footer from "./UI/Footer";
import { headers } from "next/headers";
import { Montserrat } from 'next/font/google';

const monFont = Montserrat();



export async function generateMetadata({request, params, searchParams }, parent) {

	//const headersList = await headers();

	//import { headers } from "next/headers";

	const headersList = await headers();
	const domain = headersList.get("x-forwarded-host") || "";
	const protocol = headersList.get("x-forwarded-proto") || "";
	//const pathname = headersList.get("x-invoke-path") || "";
	

 
  return {
	"metadataBase": new URL(`${protocol}:${domain}`),
    "title": "Node UTStats 2",
    "description": "Welcome to Node UTStats 2, view various stats for players, matches, maps, records and more!",
    "keywords": ["home" , "welcome", "utstats", "node"],
	"openGraph": {
		"images": ["/images/maps/default.jpg"],
		"siteName": "Node UTStats 2",
		"type": "website",
		"url": new URL(`${protocol}:${domain}`)
	}
  }
}

export default async function RootLayout({ children }) {

return (
	<html lang="en">
		<body>
			<main className={monFont.className}>
				{children}
				<Footer/>
			</main>	
		</body>
	</html>
	)
}
