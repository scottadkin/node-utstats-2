import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import React from 'react';
import Session from '../api/session';
import SiteSettings from '../api/sitesettings';
import Link from 'next/link';



const ACEPage = ({error, session, host, navSettings, mode}) =>{

    if(error !== undefined){

        return <div>
            <DefaultHead host={host} title={`Access Denied`}  
            description={``} 
            keywords={``}/>
            <main>
            <Nav settings={navSettings} session={session}/>
            <div id="content">
                <div className="default">
                    <div className="default-header">
                        Access Denied
                    </div>
                    <div id="welcome">
                        You do not have permission to view this page.
                    </div>
                </div>
            </div>
            <Footer session={session}/>
            </main>   
        </div>
    }

    return <div>
            <DefaultHead host={host} title={`ACE`}  
            description={``} 
            keywords={``}/>
            <main>
            <Nav settings={navSettings} session={session}/>
            <div id="content">
                <div className="default">
                    <div className="default-header">
                        ACE Manager
                    </div>
                    <div className="big-tabs">
                        <Link href="/ace">
                            <a>
                                <div className={`tab ${(mode === "") ? "tab-selected" : null}`}>Recent Events</div>
                            </a>
                        </Link>
                        <Link href="/ace?mode=players">
                            <a>
                                <div className={`tab ${(mode === "players") ? "tab-selected" : null}`}>Players</div>
                            </a>
                        </Link>
                        <Link href="/ace?mode=kicks">
                            <a>
                                <div className={`tab ${(mode === "kicks") ? "tab-selected" : null}`}>Kick Logs</div>
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer session={session}/>
            </main>   
        </div>
}

export async function getServerSideProps({req, query}){

    const session = new Session(req);

	await session.load();

    const settings = new SiteSettings();

    const navSettings = await settings.getCategorySettings("Navigation");

    const mode = (query.mode !== undefined) ? query.mode.toLowerCase() : "";

    if(!await session.bUserAdmin()){
       
        return {
            props: {
                "error": "",
                "host": req.headers.host,
                "session": JSON.stringify(session.settings),
                "navSettings": JSON.stringify(navSettings),
            }
        };

    }

    return {
        props: {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "mode": mode
        }
    };
}


export default ACEPage;