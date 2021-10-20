import DefaultHead from '../components/defaulthead';
import Nav from '../components/Nav';
import Footer from '../components/Footer';
import React from 'react';
import Session from '../api/session';
import SiteSettings from '../api/sitesettings';
import Link from 'next/link';
import AccessDenied from '../components/AccessDenied';
import ACE from '../api/ace';
import ACEHome from '../components/ACEHome';
import ACEPlayers from '../components/ACEPlayers';
import ACEPlayerReport from '../components/ACEPlayerReport';
import ACEKickLogs from '../components/ACEKickLogs';
import ACEKickLog from '../components/ACEKickLog';
import ACEScreenshots from '../components/ACEScreenshots';
import ACEScreenshot from '../components/ACEScreenshot';
import Functions from '../api/functions';


const ACEPage = ({error, session, host, navSettings, mode, recentKicks, recentPlayers, playerName,
    recentSShotRequests, playerSearchMode, playerSearchValue, logId, page}) =>{

    if(error !== undefined){
        return <AccessDenied host={host} session={session} navSettings={navSettings}/>
    }

    recentKicks = JSON.parse(recentKicks);
    recentPlayers = JSON.parse(recentPlayers);
    recentSShotRequests = JSON.parse(recentSShotRequests);

    let elems = [];


    const imageHost = Functions.getImageHostAndPort(host);

    if(mode === ""){
        elems = <ACEHome host={imageHost} recentKicks={recentKicks} recentPlayers={recentPlayers} recentSShots={recentSShotRequests}/>
    }else if(mode === "players"){
        elems = <ACEPlayers host={imageHost} playerSearchMode={playerSearchMode} playerSearchValue={playerSearchValue}/>
    }else if(mode === "player"){
        elems = <ACEPlayerReport host={imageHost} name={playerName}/>
    }else if(mode === "kicks"){
        elems = <ACEKickLogs host={imageHost} logId={logId} page={page} perPage={25}/>
    }else if(mode === "kick"){
        elems = <ACEKickLog host={imageHost} id={logId}/>
    }else if(mode === "screenshots"){
        elems = <ACEScreenshots host={imageHost} page={page}/>
    }else if(mode === "screenshot"){
        elems = <ACEScreenshot host={imageHost} id={logId}/>
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
                                <div className={`tab ${(mode === "players" || mode === "player") ? "tab-selected" : null}`}>Players</div>
                            </a>
                        </Link>
                        <Link href="/ace?mode=kicks">
                            <a>
                                <div className={`tab ${(mode === "kicks" || mode === "kick") ? "tab-selected" : null}`}>Kick Logs</div>
                            </a>
                        </Link>
                        <Link href="/ace?mode=screenshots">
                            <a>
                                <div className={`tab ${(mode === "screenshots" || mode === "screenshot") ? "tab-selected" : null}`}>Screenshot Requests</div>
                            </a>
                        </Link>
                    </div>

                    {elems}
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

    let playerSearchMode = "";
    let playerSearchValue = "";

    if(mode === "players"){

        if(query.name !== undefined){
            playerSearchValue = query.name;
            playerSearchMode = "name";
        }

        if(query.mac1 !== undefined){
            playerSearchValue = query.mac1;
            playerSearchMode = "mac1";
        }
        if(query.mac2 !== undefined){
            playerSearchValue = query.mac2;
            playerSearchMode = "mac2";
        }
        if(query.hwid !== undefined){
            playerSearchValue = query.hwid;
            playerSearchMode = "hwid";
        }

        if(query.ip !== undefined){
            playerSearchValue = query.ip;
            playerSearchMode = "ip";
        }
    }

    let playerName = (query.name !== undefined) ? query.name : "";

    let logId = (query.logId !== undefined) ? parseInt(query.logId) : "";
    if(logId !== logId) logId = -1;

    let page = (query.page !== undefined) ? parseInt(query.page) : 1;
    if(page !== page) page = 1;

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

    const aceManager = new ACE();

    const recentKicks = await aceManager.getHomeRecentKicks();
    const recentPlayers = await aceManager.getHomeRecentPlayers();
    const recentSShotRequests = await aceManager.getHomeRecentSShotRequests();

    return {
        props: {
            "host": req.headers.host,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "mode": mode,
            "recentKicks": JSON.stringify(recentKicks),
            "recentPlayers": JSON.stringify(recentPlayers),
            "playerName": playerName,
            "recentSShotRequests": JSON.stringify(recentSShotRequests),
            "playerSearchMode": playerSearchMode,
            "playerSearchValue": playerSearchValue,
            "logId": logId,
            "page": page
        }
    };
}


export default ACEPage;