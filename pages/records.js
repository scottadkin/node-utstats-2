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
import InteractiveTable from "../components/InteractiveTable";
import Maps from "../api/maps";

const mainTitles = {
    "0": "Player Total Records",
    "1": "Player Match Records"
}

const playtimeTypes = ["playtime", "team_0_playtime", "team_1_playtime", "team_2_playtime", "team_3_playtime", "spec_playtime"];

const getName = (names, mapId) =>{

    for(let i = 0; i < names.length; i++){

        const {value, displayValue} = names[i];
        if(value === mapId) return displayValue;
    }

    return "Not Found";
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
                ...state,
                "bLoading": false,
                "data": action.data,
                "totalResults": action.totalResults,
                "error": null
            }
        }
        case "loadData": {
            return {
                ...state,
                "bLoading": true,
                "data": null,
                "totalResults": 0
            }
        }
        case "changeMainTab": {
            return {
                ...state,
                "mainTab": action.tab,
                "page": 1
            }
        }
        case "changePlayerTotalTab": {
            return {
                ...state,
                "playerTotalTab": action.tab,
                "page": 1
            }
        }
        case "changePage": {
            return {
                ...state,
                "page": action.page
            }
        }
        case "changePerPage": {
            return {
                ...state,
                "perPage": action.perPage,
                "page": 1
            }
        }
        case "changeGametype": {
            return {
                ...state,
                "selectedGametype": action.gametype,
                "page": 1
            }
        }
        case "changeMap": {
            return {
                ...state,
                "selectedMap": action.map,
                "page": 1
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

const loadData = async (mainTab, selectedGametype, selectedMap, playerTotalTab, page, perPage, dispatch, controller) =>{

    try{

        dispatch({"type": "loadData"});

        let url = `/api/records/?mode=${mainTab}&gametype=${selectedGametype}&map=${selectedMap}`;
        url = `${url}&cat=${playerTotalTab}&page=${page}&perPage=${perPage}`;

        //console.log(url);


        const req = await fetch(url, {
            "signal": controller.signal,
            "headers": {"Content-type": "application/json"},
            "method": "GET"
        });

        const res = await req.json();

        if(res.error !== undefined){
            dispatch({"type": "error", "errorMessage": res.error});
            return;
        }

        dispatch({"type": "loaded", "data": res.data, "totalResults": res.totalResults});

    }catch(err){

        if(err.name.toLowerCase() !== "aborterror"){
            console.trace(err);
        }
    }
}

const renderError = (state) =>{

    if(state.error === null) return;

    return <ErrorMessage title="Records Data" text={state.error}/>
}

const renderPagination = (state, dispatch) =>{

    const url = `/records/?mode=${state.mainTab}&gametype=${state.selectedGametype}&map=${state.selectedMap}&type=${state.playerTotalTab}&page=`;

    return <Pagination 
        event={(page) => {
            dispatch({"type": "changePage", "page": page})
        }}
        currentPage={state.page} 
        results={state.totalResults} 
        perPage={state.perPage} 
        url={url}
    />;
}

const getCategoryName = (value, options) =>{

    for(let i = 0; i < options.length; i++){

        const o = options[i];

        if(o.value === value) return o.displayValue;
    }

    return "Not Found";
}

const renderTotalData = (state, validTypes) =>{

    if(state.mainTab !== 0) return null;

    if(state.bLoading) return <Loading />;

    const headers = {
        "place": "Place",
        "name": "Player",
        "last": "Last",
        "matches": "Matches",
        "playtime": "Playtime",
        "value": getCategoryName(state.playerTotalTab, validTypes.playerTotals)
    };

    let index = state.perPage * (state.page - 1);

    const data = state.data.map((d) =>{

        index++;

        let value = d.tvalue;

        if(playtimeTypes.indexOf(state.playerTotalTab) !== -1){
            value = <span className="playtime">{Functions.toPlaytime(value)}</span>;
        }

        return {
            "place": {
                "value": index, 
                "displayValue": `${index}${Functions.getOrdinal(index)}`, 
                "className": "place"
            },
            "name": {
                "value": d.name.toLowerCase(), 
                "displayValue": <Link href={`/player/${d.player_id}`}><CountryFlag country={d.country}/>{d.name}</Link>,
                "className": "text-left"
            },
            "last": {
                "value": d.last,
                "displayValue": Functions.convertTimestamp(d.last, true),
                "className": "playtime"
            },
            "matches": {
                "value": d.matches
            },
            "playtime": {
                "value": d.playtime,
                "displayValue": Functions.toPlaytime(d.playtime),
                "className": "playtime"
            },
            "value": {
                "value": d.tvalue,
                "displayValue": value

            }
        }
    });

    return <InteractiveTable width={1} headers={headers} data={data} perPage={100} bDisableSorting={true}/>;
}


const renderPlayerData = (state, validTypes, gametypeList, mapList) =>{

    if(state.mainTab !== 1) return null;

    if(state.bLoading) return <Loading />;


    const headers = {
        "place": "Place",
        "name": "Player",
        "date": "Date",
        "map": "Map",
        "gametype": "Gametype",
        "playtime": "Playtime",
        "value": getCategoryName(state.playerTotalTab, validTypes.playerMatches)
    };

    let i = 0;

    const data = state.data.map((d) =>{

        const place = ((state.page - 1) * state.perPage) + i + 1;

        i++;

        let value = d.tvalue;

        if(playtimeTypes.indexOf(state.playerTotalTab) !== -1){
            value = <span className="playtime">{Functions.toPlaytime(value)}</span>;
        }

        const currentMapName = d.mapName ?? "";
        const currentGametypeName = d.gametypeName ?? "";

        return {
            "place": {
                "value": place, 
                "displayValue": <>{place}{Functions.getOrdinal(place)}</>,
                "className": "place"
            },
            "name": {
                "value": d.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${d.match_id}/?player=${d.player_id}`}><CountryFlag country={d.country}/>{d.name}</Link>,
                "className": "text-left"
            },
            "date": {
                "value": d.match_date, 
                "displayValue": Functions.convertTimestamp(d.match_date,true),
                "className": "playtime"
            },
            "map": {
                "value": currentMapName.toLowerCase(), 
                "displayValue": <><Link href={`/map/${d.map_id}`}>{currentMapName}</Link></>
            },
            "gametype": {
                "value": currentGametypeName.toLowerCase(), 
                "displayValue": currentGametypeName
            },
            "playtime": {
                "value": d.playtime, 
                "displayValue": Functions.toPlaytime(d.playtime),
                "className": "playtime"
            },
            "value": {"value": d.tvalue, "displayValue": value},
        };
    });

    return <InteractiveTable width={1} headers={headers} data={data} perPage={100} bDisableSorting={true}/>;
}

const renderForm = (state, dispatch, validTypes, gametypesList, mapList, perPageOptions) =>{



    let validOptions = [];

    if(state.mainTab === 0) validOptions = validTypes.playerTotals;
    if(state.mainTab === 1) validOptions = validTypes.playerMatches;

    return <>
        <div className="default-sub-header">{mainTitles[state.mainTab]}</div>
        <div className="form m-bottom-25">

            <DropDown dName="Record Type" originalValue={state.playerTotalTab} data={validOptions}
                changeSelected={(name, value) => { dispatch({"type": "changePlayerTotalTab", "tab": value})}}
            />

            <DropDown dName="Gametype" originalValue={state.selectedGametype} data={gametypesList}
                changeSelected={(name, value) => { dispatch({"type": "changeGametype", "gametype": value})}}
            />

            <DropDown dName="Map" originalValue={state.selectedMap} data={mapList}
                changeSelected={(name, value) => { dispatch({"type": "changeMap", "map": value})}}
            />

            <DropDown dName="Results Per Page" originalValue={state.perPage} data={perPageOptions}
                changeSelected={(name, value) => { dispatch({"type": "changePerPage", "perPage": value})}}
            />
        </div>
     </>
}

const RecordsPage = ({
        host, session, pageSettings, navSettings, metaTags, 
        perPageOptions, page, perPage, validTypes, mode, type,
        gametypesList, selectedGametype, mapList, selectedMap
    }) =>{
        

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "mainTab": mode,
        "playerTotalTab": type,
        "perPage": perPage,
        "page": page,
        "error": null,
        "selectedGametype": selectedGametype,
        "selectedMap": selectedMap,
        "totalResults": 0,
        "data": null
        
    });

    useEffect(() =>{

        const controller = new AbortController();


        loadData(state.mainTab, state.selectedGametype, state.selectedMap, state.playerTotalTab, state.page, state.perPage, dispatch, controller);

        return () =>{
            controller.abort();
        }
    }, [
        state.mainTab, 
        state.playerTotalTab, 
        state.page, 
        state.perPage, 
        state.selectedGametype,
        state.selectedMap
    ])

    const title = (state.mainTab !== mode) ? mainTitles[state.mainTab] : metaTags.title;

    return <div>
        <DefaultHead host={host} title={title} description="" keywords="records,players,ctf,combogib"/>	
        <main>
            <Nav settings={navSettings} session={session}/>
            <div id="content">
                <div className="default">	

                    

                    <div className="default-header">Records</div>
                    {renderTabs(state, dispatch)}

                    {renderForm(state, dispatch, validTypes, gametypesList, mapList, perPageOptions)}

                    {renderError(state)}
                    {renderPagination(state, dispatch)}
                    {renderTotalData(state, validTypes)}
                    {renderPlayerData(state, validTypes, gametypesList, mapList)}
                    {renderPagination(state, dispatch)}
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

    let type = query.type ?? "frags";

    let gametype = (query.gametype !== undefined) ? parseInt(query.gametype) : 0;
    if(gametype !== gametype) gametype = 0;

    let map = (query.map !== undefined) ? parseInt(query.map) : 0;
    if(map !== map) map = 0;


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

    const mapManager = new Maps();

    const mapList = await mapManager.getAllDropDownOptions();

    
    mapList.unshift({"value": 0, "displayValue": "All Maps"});
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
                "playerTotals": r.validPlayerTotalTypes,
                "playerMatches": r.validPlayerMatchOptions
            },
            "gametypesList": gametypeList,
            "selectedGametype": gametype,
            "mapList": mapList,
            "selectedMap": map
        }
    }
}

export default RecordsPage;