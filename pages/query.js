import Session from "../api/session";
import Analytics from "../api/analytics";
import SiteSettings from "../api/sitesettings";
import DefaultHead from "../components/defaulthead";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import ServerQueryList from "../components/ServerQueryList";

const QueryPage = ({host, navSettings, session}) =>{

    return <div>
    <DefaultHead host={host} title={"Server Query"} description="Welcome to Node UTStats 2, view various stats for players,matches,maps,records and more!" keywords="home,welcome"/>	
    <main>
        <Nav settings={navSettings} session={session}/>
        
        <div id="content">
            <div className="default">	
            
				<ServerQueryList />
            
            </div>
        </div>
        <Footer session={session}/>
    </main>   
    </div>
}

export async function getServerSideProps({req, query}){

    const session = new Session(req);
    await session.load();

    const siteSettings = new SiteSettings();
    const navSettings = await siteSettings.getCategorySettings("Navigation");

    

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);
    return {
        "props": {
            "navSettings": JSON.stringify(navSettings),
			"session": JSON.stringify(session.settings),
            "host": req.headers.host
        }
    }
}

export default QueryPage;