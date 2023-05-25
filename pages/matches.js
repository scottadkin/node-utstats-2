import DefaultHead from "../components/defaulthead";
import Nav from "../components/Nav";
import Footer from "../components/Footer";
import {React, useEffect, useReducer} from "react";
import Session from "../api/session";
import SiteSettings from "../api/sitesettings";
import Analytics from "../api/analytics";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import ErrorPage from "./ErrorPage";
import DropDown from "../components/DropDown";
import MatchesTableView from "../components/MatchesTableView";
import MatchesDefaultView from "../components/MatchesDefaultView";
import Pagination from "../components/Pagination";
import SearchTerms from "../components/SearchTerms";
import Functions from "../api/functions";
import Servers from "../api/servers"
import Gametypes from "../api/gametypes";
import Maps from "../api/maps";

const reducer = (state, action) =>{

    switch(action.type){

        case "namesLoaded": {
            return {
                ...state,
                "serverNames": action.serverNames,
                "gametypeNames": action.gametypeNames,
                "mapNames": action.mapNames,
                "bNamesLoading": false
            }
        }
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "totalMatches": action.totalMatches,
                "images": action.images,
                "data": action.data,
                
            }
        }
        case "serverChanged": {
            return {
                ...state,
                "selectedServer": action.serverId
            }
        }
        case "gametypeChanged": {
            return {
                ...state,
                "selectedGametype": action.gametypeId
            }
        }
        case "mapChanged": {
            return {
                ...state,
                "selectedMap": action.mapId
            }
        }
        case "displayModeChanged": {
            return {
                ...state,
                "displayMode": action.displayMode
            }
        }
        case "perPageChanged": {
            return {
                ...state,
                "perPage": action.perPage
            }
        }
        case "error": {
            return {
                ...state,
                "error": action.errorMessage,
                "bLoading": false,
                "bNamesLoading": false
            }
        }
        default:{
            return state;
        }
    }
}

const Matches = ({host, pageError, metaData, session, navSettings, pageSettings, server, gametype, map, page, perPage, displayMode}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "bNamesLoading": true,
        "selectedServer": server,
        "selectedGametype": gametype,
        "selectedMap": map,
        "perPage": perPage,
        "images": {},
        "totalMatches": 0,
        "data": [],
        "mapNames": [],
        "serverNames": [],
        "gametypeNames": [],
        "displayMode": displayMode
    });


    const imageHost = Functions.getImageHostAndPort(host);

    useEffect(() =>{

        const controller = new AbortController();
        
        const loadNames = async () =>{

            try{


                const req = await fetch("/api/matchsearch", {
                    "signal": controller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode": "full-list"})
                });
        
                const res = await req.json();
        
                if(res.error !== undefined){
        
                    dispatch({"type": "error", "errorMessage": res.error});
                    //this.setState({"error": res.error});
        
                }else{
        

                    dispatch({
                        "type": "namesLoaded", 
                        "serverNames": res.serverNames, 
                        "gametypeNames": res.gametypeNames, 
                        "mapNames": res.mapNames
                    });
                }

            }catch(err){

                if(err.name !== "AbortError"){
                    console.trace(err);
                }

           
            }
        }


        loadNames();

        return () =>{
            controller.abort();
        }

    }, []);


    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            try{

                const req = await fetch("/api/matchsearch", {
                    "signal": controller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({
                        "mode": "search",
                        "serverId": state.selectedServer,
                        "gametypeId": state.selectedGametype,
                        "mapId": state.selectedMap,
                        "perPage": state.perPage,
                        "page": page
        
                    })
                });
        
                const res = await req.json();
        
                if(res.error !== undefined){
        
                    dispatch({"type": "error", "errorMessage": res.error});
                    //this.setState({"error": res.error});
                }else{
        
                    dispatch({
                        "type": "loaded", 
                        "totalMatches": res.totalMatches, 
                        "images": res.images,
                        "data": res.data
                    });
                    
                // this.setState({"matches": res.data, "images": JSON.stringify(res.images)});
                }
            }catch(err){

                if(err.name !== "AbortError"){
                    console.trace(err);
                }
            }
        }

        loadData();

        return () =>{
            controller.abort();
        }

    }, [state.selectedServer, state.selectedGametype, state.selectedMap, page, state.perPage]);

    const getMetaData = () =>{

        const serverString = metaData.serverName;
        const gametypeString = metaData.gametypeName;
        const mapString = metaData.mapName;

        const keywords = [];

        let title = "";

        let description = "";

        if(mapString !== ""){

            title = `Matches on ${mapString}`;

            description = `Search results for matches played on the map ${mapString}`;

            keywords.push(mapString);
        }

        if(gametypeString !== ""){

            keywords.push(gametypeString);

            if(title !== ""){
                title += ` (${gametypeString})`;
            }else{
                title = `${gametypeString} games`;
            }

            if(description !== ""){
                description += `, with the gametype of ${gametypeString}`;
            }else{

                description = `Search results for matches played using the ${gametypeString} gametype`
            } 

            
        }


        if(serverString !== ""){

            keywords.push(serverString);

            if(title !== ""){
                title += " on ";
            }

            if(description !== ""){
                description += `, on the ${serverString} server`;
            }

            title += serverString;
        }

        if(description === ""){

            description = "View the latest Unreal Tournament matches from all our servers here.";
        }else{
            description += ".";
        }

        if(title === ""){
            title = "Recent Matches";
        }

        if(keywords.length === 0){
            keywords.push("recent");
        }


        return {"keywords": keywords, "title": title, "description": description}
    }

    const renderMatches = () =>{

        if(state.data.length === 0){
            return <div key="matches">
                No matches found.
            </div>
        }

        let matches = null;

        if(parseInt(state.displayMode) === 0){
            matches = <div className="center" style={{"width": "var(--width-1)"}}>
                <MatchesDefaultView data={state.data} images={state.images} host={imageHost}/>
            </div>;
        }else{
            matches = <MatchesTableView data={state.data}/>;
        }

        return <div key="matches">    
            {matches}
        </div>
    }

    const getName = (type, id) =>{

        id = parseInt(id);

        let names = [];

        if(type === "server") names = state.serverNames;
        if(type === "gametype") names = state.gametypeNames;
        if(type === "map") names = state.mapNames;


        for(let i = 0; i < names.length; i++){

            const n = names[i];

            if(parseInt(n.id) === id) return n.name;
        }

        return "Not Found";
    }

    const renderSearchTitle = () =>{


        if(state.selectedServer === 0 && state.selectedGametype === 0 && 
            state.selectedMap === 0){
            return null;
        }
        
        const terms = {};

        if(state.selectedServer !== 0){
            terms["Server"] = getName("server", state.selectedServer);
        }

        if(state.selectedGametype !== 0){
            terms["Gametype"] = getName("gametype", state.selectedGametype);
        }

        if(state.selectedMap !== 0){
            terms["Map"] = getName("map", state.selectedMap);
        }
    
        return <div key="search-title">
            <div className="default-header">Search Results</div>
            <SearchTerms data={terms}/>
        </div>
    }


    const changeSelected = (name, value) =>{


        name = name.toLowerCase();

        if(name === "selectedserver"){
            dispatch({"type": "serverChanged", "serverId": value});
        }

        if(name === "selectedgametype"){
            dispatch({"type": "gametypeChanged", "gametypeId": value});
        }

        if(name === "selectedmap"){
            dispatch({"type": "mapChanged", "mapId": value});
        }

        if(name === "displaymode"){
            dispatch({"type": "displayModeChanged", "displayMode": parseInt(value)});
        }

        if(name === "perpage"){
            dispatch({"type": "perPageChanged", "perPage": parseInt(value)});
        }
        //dispatch({});
    }

    const getPerPageData = () =>{

        return [
            {"value": "5", "displayValue": 5},
            {"value": "10", "displayValue": 10},
            {"value": "25", "displayValue": 25},
            {"value": "50", "displayValue": 50},
            {"value": "75", "displayValue": 75},
            {"value": "100", "displayValue": 100}
        ];

    }

    const getDisplayModeData = () =>{

        return [
            {"value": "0", "displayValue": "Default View"},
            {"value": "1", "displayValue": "Table View"},
        ];
    }

    const getDropDownList = (type) =>{

        const found = [];

        let data = [];

        if(type === "servers") data = state.serverNames;
        if(type === "gametypes") data = state.gametypeNames;
        if(type === "maps") data = state.mapNames;

        for(let i = 0; i < data.length; i++){

            const {id, name} = data[i];

            found.push({"value": id, "displayValue": name});
        }

        return found;
    }

    const renderSearchForm = () =>{

        const s = state.selectedServer;
        const g = state.selectedGametype;
        const m = state.selectedMap;
        const d = state.displayMode;

        const url = `/matches?server=${s}&gametype=${g}&map=${m}&display=${d}&page=1&pp=${state.perPage}`;

        return <div key="s-f" className="form m-bottom-25">
            <DropDown 
                dName="Server" 
                fName="selectedServer" 
                originalValue={s.toString()} 
                data={getDropDownList("servers")} 
                changeSelected={changeSelected}
            />
            <DropDown 
                dName="Gametype" 
                fName="selectedGametype" 
                originalValue={g.toString()} 
                data={getDropDownList("gametypes")} 
                changeSelected={changeSelected}
            />
            <DropDown 
                dName="Map" 
                fName="selectedMap" 
                originalValue={m.toString()} 
                data={getDropDownList("maps")} 
                changeSelected={changeSelected}
            />
            <DropDown 
                dName="Results Per Page" 
                fName="perPage" 
                originalValue={state.perPage.toString()} 
                data={getPerPageData()} 
                changeSelected={changeSelected}
            />
            <DropDown 
                dName="Display Style" 
                fName="displayMode" 
                originalValue={state.displayMode.toString()} 
                data={getDisplayModeData()} 
                changeSelected={changeSelected}
            />
  
        </div>
    }

    const renderElems = () =>{

        const elems = [];

        if(state.bLoading) return <Loading />;
        if(state.error !== null) return <ErrorMessage title="Match Search" text={state.error}/>

        elems.push(renderSearchForm());
        elems.push(renderSearchTitle());
        elems.push(renderPagination(0));
        elems.push(renderMatches());
        elems.push(renderPagination(1));

        return elems;
    }

    const renderPagination = (key) =>{

        const url = `/matches/?server=${state.selectedServer}&gametype=${state.selectedGametype}&map=${state.selectedMap}&display=${0}&pp=${state.perPage}&page=`;

        return <Pagination key={key} url={url} currentPage={page} perPage={state.perPage} results={state.totalMatches}/>;
    }
    

    if(pageError !== undefined){
        return <ErrorPage>{pageError}</ErrorPage>
    }

    const {title, keywords, description} = getMetaData();
    const elems = renderElems();

    

    return (<div>
        <DefaultHead 
            host={host} 
            title={title} 
            description={description} 
            keywords={`search,match,matches,history,${keywords.toString()}`}
        />
        <main>
            <Nav settings={navSettings} session={session}/>
            <div id="content">

                <div className="default">
                    <div className="default-header">
                        Matches
                    </div>
                    
                    {elems}
                </div>
            </div>
            <Footer session={session}/>
        </main>
    </div>);
}

export async function getServerSideProps({req, query}){

    try{

        const session = new Session(req);
        await session.load();

        const settings = new SiteSettings();
        const navSettings = await settings.getCategorySettings("Navigation");

        const pageSettings = await settings.getCategorySettings("Matches Page");

        const defaultPerPage = pageSettings["Default Display Per Page"];

        let perPage = defaultPerPage;
        let page = 1;
        let gametype = 0;
        let displayType = 0;
        let server = 0;
        let map = 0;
        let displayMode = pageSettings["Default Display Type"];

        if(query.pp !== undefined){

            perPage = parseInt(query.pp);

            if(perPage !== perPage){
                perPage = defaultPerPage;
            }else{
                if(perPage < 5 || perPage > 100){
                    perPage = defaultPerPage;
                }
            }
        }

        if(query.gametype !== undefined){

            gametype = parseInt(query.gametype);
            if(gametype !== gametype) gametype = 0;

        }

        if(query.server !== undefined){

            server = parseInt(query.server);
            if(server !== server) server = 0;
        }

        if(query.map !== undefined){

            map = parseInt(query.map);
            if(map !== map) map = 0;
        }

        if(query.page !== undefined){

            page = parseInt(query.page);

            if(page !== page) page = 1;
        }

        if(query.display !== undefined){

            displayMode = parseInt(query.display);

            if(displayMode !== displayMode) displayMode = pageSettings["Default Display Type"];
        }

        await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);


        let metaServerName = "";

        if(server !== 0){

            const serverManager = new Servers();
            metaServerName = await serverManager.getName(server);

        }

        let metaGametypeName = "";

        if(gametype !== 0){

            const gametypeManager = new Gametypes();
            metaGametypeName = await gametypeManager.getName(gametype);
        }

        let metaMapName = "";

        if(map !== 0){

            const mapManager = new Maps();
            metaMapName = await mapManager.getName(map);
        }

        const metaData = {
            "mapName": metaMapName,
            "serverName": metaServerName,
            "gametypeName": metaGametypeName
        };

        return {
            "props": {
                "host": req.headers.host,
                "page": page,
                "perPage": perPage,
                "displayType": displayType,
                "session": session.settings,
                "navSettings": navSettings,
                "pageSettings": pageSettings,
                "perPage": perPage,
                "gametype": gametype,
                "server": server,
                "map": map,
                "displayMode": displayMode,
                "metaData": metaData
            }
        };

    }catch(err){

        return {
            "props": {
                "pageError": err.toString()
            }
        }
    }
}

export default Matches;