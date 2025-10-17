import Nav from "../UI/Nav";
import {getNavSettings} from "../../../api/sitesettings";
import Session from "../../../api/session";
import { headers, cookies } from "next/headers";
import MainForm from "../UI/LoginRegister/MainForm";

export async function generateMetadata({ params, searchParams }, parent) {

 
  return {
    "title": "Login - Node UTStats 2",
    "description": "Login to Node UTStats 2",
    "keywords": ["home" , "welcome", "utstats", "node", "login"],
  }
}

export default async function Page(){

    
	const cookieStore = await cookies();
	const header = await headers();
	const cookiesData = cookieStore.getAll();

	console.log(cookiesData);

	const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
	
	const session = new Session(ip, cookiesData);

	await session.load();
	const navSettings = await getNavSettings();
	const sessionSettings = session.settings;

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <MainForm />
        </div>   
    </main>; 
}