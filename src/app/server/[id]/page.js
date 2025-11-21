import Nav from "../../UI/Nav";
import Session from "../../../../api/session";
import { getNavSettings, getPageOrder, getSettings, PageComponentManager } from "../../../../api/sitesettings";
import { cookies, headers } from "next/headers";
import { getServer } from "../../../../api/servers";
import ErrorPage from "../../UI/ErrorPage";
import BasicInfo from "../../UI/Server/BasicInfo";

export async function generateMetadata({ params, searchParams }, parent) {

    const query = await params;
    const serverId = (query.id !== undefined) ? parseInt(query.id) : NaN;

    let title = "Not Found";

    let basicInfo = null;

    if(serverId === serverId){

        basicInfo = await getServer(serverId);
    }

    if(basicInfo !== null){
        title = basicInfo.name;
    }

    return {
        "title": `${title} - Node UTStats 2`,
        "description": `View information about the Unreal Tournament Server called ${title}`
    }
}

export default async function Page({params, searchParams}){

    const query = await params;
    const cookieStore = await cookies();
    const header = await headers();
    const cookiesData = cookieStore.getAll();

    const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
    
    const session = new Session(ip, cookiesData);

    await session.load();
    const navSettings = await getNavSettings();
    const sessionSettings = session.settings;

    console.log(sessionSettings);

    const pageSettings = await getSettings("Server Pages");
    const pageOrder = await getPageOrder("Server Pages");

    console.log(query);

    const serverId = (query.id !== undefined) ? parseInt(query.id) : NaN;

    if(serverId !== serverId){

        return <ErrorPage navSettings={navSettings} sessionSettings={sessionSettings} title="Invalid ServerId">
            ServerId must be a valid integer.
        </ErrorPage>
    }

    const basicInfo = await getServer(serverId);

    if(basicInfo === null){
        return <ErrorPage navSettings={navSettings} sessionSettings={sessionSettings} title="Server Not Found">
            There are no servers with that id.
        </ErrorPage>
    }

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content">
            <div className="default">
                <div className="default-header">{basicInfo.name}</div>        
                <BasicInfo data={basicInfo}/>
            </div>    
        </div>   
    </main>
}