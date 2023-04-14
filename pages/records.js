import DefaultHead from "../components/defaulthead";
import Nav from "../components/Nav/";
import Footer from "../components/Footer/";
import Players from "../api/players";
import Functions from "../api/functions";
import Pagination from "../components/Pagination/";
import {useReducer, useEffect} from "react";
import Link from "next/link";
import Session from "../api/session";
import SiteSettings from "../api/sitesettings";
import Analytics from "../api/analytics";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import Table2 from "../components/Table2";
import CountryFlag from "../components/CountryFlag";
import CTFCapRecords from "../components/CTFCapRecords";
import CombogibRecords from "../components/CombogibRecords";
import Combogib from "../api/combogib";
import Tabs from "../components/Tabs";
import DropDown from "../components/DropDown";
import Gametypes from "../api/gametypes";
import Records from "../api/records";

const controller = new AbortController();

const mainTitles = {
    "0": "Player Total Records",
    "1": "Player Match Records",
    "2": "Player Map Records",
}




const renderTabs = (state, dispatch) =>{

    const options = [
        {"value": 0, "name": mainTitles[0]},
        {"value": 1, "name": mainTitles[1]},
        {"value": 2, "name": mainTitles[2]},
    ];

    return <Tabs 
        options={options} 
        selectedValue={state.mainTab} 
        changeSelected={(newTab) => dispatch({"type": "changeMainTab", "tab": newTab})}
    />
}

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                ...state
            }
        }
        case "changeMainTab": {
            return {
                ...state,
                "mainTab": action.tab
            }
        }
        case "changePlayerTotalTab": {
            return {
                ...state,
                "playerTotalTab": action.tab
            }
        }
        case "changePerPage": {
            return {
                ...state,
                "perPage": action.perPage
            }
        }
        case "changeGametype": {
            return {
                ...state,
                "selectedGametype": action.gametype
            }
        }
        case "error": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage
            }
        }
    }

    return state;
}

const loadData = async (state, dispatch) =>{



    const req = await fetch(`/api/records/?mode=${state.mainTab}&cat=${state.playerTotalTab}&page=${state.page}&perPage=${state.perPage}`, {
        "signal": controller.signal,
        "headers": {"Content-type": "application/json"},
        "method": "GET"
    });

    const res = await req.json();

    console.log(res);

    if(res.error !== undefined){
        dispatch({"type": "error", "errorMessage": res.error});
        return;
    }
}

const renderError = (state) =>{

    if(state.error === null) return;

    return <ErrorMessage title="Records Data" text={state.error}/>
}

const RecordsPage = ({
        host, session, pageSettings, navSettings, metaTags, 
        perPageOptions, page, perPage, validTypes, mode,
        gametypesList, selectedGametype
    }) =>{

    const [state, dispatch] = useReducer(reducer, {
        "mainTab": 0,
        "playerTotalTab": "playtime",
        "perPage": perPage,
        "page": page,
        "error": null,
        "selectedGametype": selectedGametype
        
    });

    
    

    useEffect(() =>{

        loadData(state, dispatch);

        return () =>{
            controller.abort();
        }
    }, [])

    const title = (state.mainTab !== mode) ? mainTitles[state.mainTab] : metaTags.title;

    return <div>
        <DefaultHead host={host} title={title} description="" keywords="records,players,ctf,combogib"/>	
        <main>
            <Nav settings={navSettings} session={session}/>
            <div id="content">
                <div className="default">	

                    

                    <div className="default-header">Records</div>
                    {renderTabs(state, dispatch)}

                    <div className="default-sub-header">Player Total Records</div>
                    <div className="form m-bottom-25">
       
                        <DropDown dName="Record Type" originalValue={state.playerTotalTab} data={validTypes.playerTotals}
                            changeSelected={(name, value) => { dispatch({"type": "changePlayerTotalTab", "tab": value})}}
                        />

                        <DropDown dName="Gametype" originalValue={state.selectedGametype} data={gametypesList}
                            changeSelected={(name, value) => { dispatch({"type": "changeGametype", "gametype": value})}}
                        />


                        <DropDown dName="Results Per Page" originalValue={state.perPage} data={perPageOptions}
                            changeSelected={(name, value) => { dispatch({"type": "changePerPage", "perPage": value})}}
                        />
                    </div>

                    {renderError(state)}
                </div>
            </div>
            <Footer session={session}/>
        </main>   
        </div>
}

export async function getServerSideProps({req, query}){

    const session = new Session(req);
	await session.load();

    let mode = (query.mode !== undefined) ? parseInt(query.mode) : 0;
    if(mode !== mode) mode = 0;

    let page = (query.page !== undefined) ? parseInt(query.page) : 1;
    if(page !== page) page = 1;

    let type = query.type ?? "kills";

    let gametype = (query.gametype !== undefined) ? parseInt(query.gametype) : 0;
    if(gametype !== gametype) gametype = 0;

    console.log(`gametype = ${gametype}`);


    //also used as combo mode
    //let capMode = parseInt(query.cm) ?? 0;
    //if(capMode !== capMode) capMode = 0;

    const settings = new SiteSettings();
    const navSettings = await settings.getCategorySettings("Navigation");
    const pageSettings = await settings.getCategorySettings("Records Page");
    const defaultPerPage = parseInt(pageSettings["Default Per Page"]);

    let perPage = query.pp ?? defaultPerPage ?? 25;

    if(perPage !== perPage) perPage = 25;
    if(perPage <= 0 || perPage > 100) perPage = defaultPerPage;

    const playerManager = new Players();
    const validTypes = playerManager.getValidRecordTypes();

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);

    const comboManager = new Combogib();

    const validComboTypes = comboManager.getValidRecordTypes();

    const metaTags = {
        "title": (mainTitles[mode] !== undefined) ? `${mainTitles[mode]}` : "Records"
    };

    
    const r = new Records();

    //const validPlayerTotalTypes = r.validPlayerTotalTypes;

    //console.log(await r.debugGetColumnNames());

    const gm = new Gametypes();



    const gametypeList = await gm.getDropDownOptions();



    return {
        "props": {
            "host": req.headers.host,
            "mode": mode,
            "page": page,
            "type": type.toLowerCase(),
            "perPage": perPage,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": pageSettings,
            "metaTags": metaTags,
            "perPageOptions": r.totalPerPageOptions,
            "validTypes": {
                "playerTotals": r.validPlayerTotalTypes
            },
            "gametypesList": gametypeList,
            "selectedGametype": gametype
        }
    }
}

export default RecordsPage;