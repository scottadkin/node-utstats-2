import Nav from "../UI/Nav";
import {getNavSettings} from "../../../api/sitesettings";
import Session from "../../../api/session";
import { headers, cookies } from "next/headers";
import ErrorPage from "../UI/ErrorPage";

export default async function Page({}){
    
    const cookieStore = await cookies();
    const header = await headers();
    const cookiesData = cookieStore.getAll();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const navSettings = await getNavSettings();
    const sessionSettings = session.settings;

    const bAdmin = await session.bUserAdmin();


    if(!bAdmin){
        return <ErrorPage navSettings={navSettings} sessionSettings={sessionSettings} title="Access Denied">You do not have the access to this area.</ErrorPage>;
    }

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default-header">Admin Control Panel</div>
        </div>   
    </main>; 
}