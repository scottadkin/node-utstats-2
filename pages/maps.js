import DefaultHead from "../components/defaulthead";
import Nav from "../components/Nav/";
import Footer from "../components/Footer/";
import Functions from "../api/functions";
import Pagination from "../components/Pagination";
import {useReducer, useEffect} from "react";
import Session from "../api/session";
import SiteSettings from "../api/sitesettings";
import Analytics from "../api/analytics";
import Router from "next/router";
import DropDown from "../components/DropDown";
import MapsDefaultView from "../components/MapsDefaultView";
import MapsTableView from "../components/MapsTableView";
import Loading from "../components/Loading";
import ErrorMessages from "../components/ErrorMessage";

const setUrl = (query) =>{

    Router.push({
        "pathname": "/maps",
        "query": query
      }, 
      undefined, { shallow: true }
    );
}

const reducer = (state, action) =>{

    switch(action.type){

        case "changePerPage": {

            const query = {
                "displayType": state.displayMode,
                "perPage": action.value,
                "sortBy": state.sortBy,
                "bAsc": state.order,
                "page": 1
            };

            if(state.searchName !== ""){

                query.name = state.searchName;
            }
            
            setUrl(query);

            return {
                ...state,
                "perPage": action.value
            }
        }
        case "changeDisplayMode": {

            const query = {
                "displayType": action.value,
                "perPage": state.perPage,
                "sortBy": state.sortBy,
                "bAsc": state.order,
                "page": 1
            };

            if(state.searchName !== ""){

                query.name = state.searchName;
            }
            
            setUrl(query);

            return {
                ...state,
                "displayMode": action.value
            }
        }
        case "changeSearchName": {

            const query = {
                "displayType": state.displayMode,
                "perPage": state.perPage,
                "sortBy": state.sortBy,
                "bAsc": state.order,
                "page": 1
            };

            //if(state.searchName !== ""){

                query.name = action.value;
            //}
            
            setUrl(query);

            return {
                ...state,
                "searchName": action.value
            }
        }
        case "changeOrder": {

            const query = {
                "displayType": state.displayMode,
                "perPage": state.perPage,
                "sortBy": state.sortBy,
                "bAsc": action.value,
                "page": 1
            };

            if(state.searchName !== ""){

                query.name = state.searchName;
            }

            setUrl(query);

            return {
                ...state,
                "order": action.value
            }
        }
        case "changeSortBy": {

            let currentOrder = state.order;

            if(action.value === state.sortBy){

                if(currentOrder === 0){
                    currentOrder = 1;
                }else if(currentOrder === 1){
                    currentOrder = 0;
                }
            }

            //let url = "";

            const query = {
                "displayType": state.displayMode,
                "perPage": state.perPage,
                "sortBy": action.value,
                "bAsc": state.order,
                "page": 1
            };

            if(state.searchName !== ""){

                query.name = state.searchName;
            }

            setUrl(query);

            return {
                ...state,
                "sortBy": action.value,
                "order": currentOrder
            }
        }
        case "loaded": {
            return {
                ...state,
                "bLoading": false,
                "error": null,
                "data": action.data,
                "totalResults": action.totalResults
            }
        }
        case "error": {
            return {
                ...state,
                "bLoading": false,
                "error": action.errorMessage,
                "data": []
            }
        }
    }

    return state;
}

async function loadData(dispatch, searchName, page, order, sortBy, perPage, controller){

    const url = `/api/mapsearch?name=${searchName}&page=${page}&order=${order}&sortBy=${sortBy}&perPage=${perPage}`;

    try{

        const req = await fetch(url, {
            "signal": controller.signal
        });
        
        const res = await req.json();

        if(res.error !== undefined){

            dispatch({"type": "error", "errorMessage": res.error});
            return;
        }

        dispatch({"type": "loaded", "data": res.data, "totalResults": res.totalResults});

    }catch(err){
        if(err.name === "AbortError") return;
        console.trace(err);
        dispatch({"type": "error", "errorMessage": err.toString()});
    }
}

const Maps = ({session, navSettings, host, page, perPage, name, displayType, bAsc, sortBy}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "page": page,
        "perPage": perPage,
        "mapList": [],
        "data": [],
        "pages": 1,
        "displayMode": displayType,
        "searchName": name,
        "order": bAsc,
        "sortBy": sortBy,
        "totalResults": 9
    });

    useEffect(() =>{

        const controller = new AbortController();

        loadData(dispatch, state.searchName, page, state.order, state.sortBy, state.perPage, controller);

        return () =>{
            controller.abort();
        }

    }, [state.searchName, page, state.perPage, state.order, state.sortBy]);


    let start = (page - 1) * state.perPage;
    if(start < 0) start = 0;
    

    let title = "Maps";
    let description = "View all the maps that have been played on our servers.";

    if(state.searchName !== ""){

        title = `Map search result for "${state.searchName}"`;
        description = `Map search results for "${state.searchName}", page ${page} of ${state.pages}.`;
    }

    let url = "";

    if(state.searchName !== ""){
        url = `/maps?displayType=${state.displayMode}&perPage=${state.perPage}&sortBy=${state.sortBy}&bAsc=${state.order}&name=${state.searchName}&page=`;
    }else{
        url = `/maps?displayType=${state.displayMode}&perPage=${state.perPage}&sortBy=${state.sortBy}&bAsc=${state.order}&page=`;
    }

    const pageinationElem = <Pagination url={url} results={state.totalResults} currentPage={page} perPage={state.perPage}/>;
    const imageHost = Functions.getImageHostAndPort(host);

    let elems = null;

    if(state.bLoading){
        elems = <Loading />;
    }

    if(state.error === null && !state.bLoading){

        if(state.displayMode === 0){
            elems = <MapsDefaultView data={state.data} host={imageHost}/>;      
        }else{
            elems = <MapsTableView data={state.data} dispatch={dispatch} />//renderTable(state.data, dispatch);
        }

    }else if(!state.bLoading){
        elems = <ErrorMessages title="Maps List" text={state.error}/>
    }

    return <div>
        <DefaultHead host={host} title={`${title} - Page ${page} of ${state.pages}`}  
        description={description} 
        keywords={`search,map,maps`}/>
        <main>
        <Nav settings={navSettings} session={session}/>
        <div id="content">
            <div className="default">
                <div className="default-header">
                    Maps
                </div>
                <div className="form m-bottom-25">
                    <div className="default-sub-header-alt">Search For A Map</div>
                    <div className="form-row">
                        <div className="form-label">Map Name</div>
                        <input type="text" className="default-textbox" placeholder="name..." defaultValue={name} onKeyDown={((e) =>{
                            dispatch({"type": "changeSearchName", "value": e.target.value});
                        })} onKeyUp={((e) =>{
                            dispatch({"type": "changeSearchName", "value": e.target.value});
                        })}/>   
                    </div>

                    <DropDown dName="Sort By" 
                        fName="sort"
                        data={[
                            {"value": "name", "displayValue": "Name"},
                            {"value": "first", "displayValue": "First"},
                            {"value": "last", "displayValue": "Last"},
                            {"value": "matches", "displayValue": "Matches"},
                            {"value": "playtime", "displayValue": "Playtime"},
                        ]}
                        changeSelected={(name, value) =>{
                            dispatch({"type": "changeSortBy", "value": value});
                        }}
                        originalValue={state.sortBy}  
                    />
      
                    <DropDown dName="Order" 
                        fName="order"
                        data={[
                            {"value": 1, "displayValue": "Ascending"},
                            {"value": 0, "displayValue": "Descending"},
                        ]}
                        changeSelected={(name, value) =>{
                            dispatch({"type": "changeOrder", "value": value});
                        }}
                        originalValue={state.order}  
                    />
                    <DropDown dName="Display" 
                        fName="display"
                        data={[
                            {"value": 0, "displayValue": "Normal View"},
                            {"value": 1, "displayValue": "Table View"}           
                        ]}
                        changeSelected={(name, value) =>{
                            dispatch({"type": "changeDisplayMode", "value": value});
                        }}
                        originalValue={state.displayMode}  
                    />
                    <DropDown dName="Results Per Page"
                        data={[
                            {"value": 5, "displayValue": 5},
                            {"value": 10, "displayValue": 10},
                            {"value": 25, "displayValue": 25},
                            {"value": 50, "displayValue": 50},
                            {"value": 100, "displayValue": 100}
                        ]} 
                        fName="order"
                        changeSelected={(name, value) =>{
                            dispatch({"type": "changePerPage", "value": value});
                        }}
                        originalValue={state.perPage}
                    />
                
                </div>
                {pageinationElem}
                {elems}
                {pageinationElem}
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
    const pageSettings = await settings.getCategorySettings("Maps Page");


    let page = 1;
    let perPage = parseInt(pageSettings["Default Display Per Page"]);

    if(session.cookies["mapsPerPage"] !== undefined){

        perPage = parseInt(session.cookies["mapsPerPage"]);
        if(perPage !== perPage) perPage = parseInt(pageSettings["Default Display Per Page"]);
    }

    let displayType = 0;
    let name = "";
    let bAsc = 0;
    let sortBy = (query.sortBy !== undefined) ? query.sortBy : "name";

    const defaultPerPage = (pageSettings["Default Display Per Page"] !== undefined) ? parseInt(pageSettings["Default Display Per Page"]) : 25;
    const defaultDisplayType = (pageSettings["Default Display Type"] !== undefined) ? parseInt(pageSettings["Default Display Type"]) : 0;

    page = (query.page !== undefined) ? parseInt(query.page) : 1;
    perPage = (query.perPage !== undefined) ? parseInt(query.perPage) : defaultPerPage;
    displayType = (query.displayType !== undefined) ? parseInt(query.displayType) : defaultDisplayType;

    if(displayType !== displayType) displayType = defaultDisplayType;

    if(query.name !== undefined) name = query.name;
    bAsc = (query.bAsc !== undefined) ? parseInt(query.bAsc) : 1;
    if(bAsc !== bAsc) bAsc = 1;
    
    if(page !== page) page = 1;
    if(perPage !== perPage) perPage = defaultPerPage;
    
    await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);

    return {
        props: {
            "host": req.headers.host,
            "page": page,
            "perPage": perPage,
            "displayType": displayType,
            "name": name,
            "bAsc": bAsc,
            "sortBy": sortBy,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings)
        }
    };
}


export default Maps;