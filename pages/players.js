import Session from "../api/session";
import Analytics from "../api/analytics";
import SiteSettings from "../api/sitesettings";
import DefaultHead from "../components/defaulthead";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import { useReducer, useEffect } from "react";
import { useRouter } from "next/router";
import CountriesListDropDown from "../components/CountriesListDropDown";
import PerPageDropDown from "../components/PerPageDropDown";
import DropDown from "../components/DropDown";
import NotificationsCluster from "../components/NotificationsCluster";
import {notificationsInitial, notificationsReducer} from "../reducers/notificationsReducer";
import Loading from "../components/Loading";
import { cleanInt, convertTimestamp, toPlaytime } from "../api/generic.mjs";
import CustomTable from "../components/CustomTable";
import CountryFlag from "../components/CountryFlag";
import Link from "next/link";
import Pagination from "../components/Pagination";
import PlayerSearch from "../api/playersearch";
import Countires from "../api/countries";

const setOrder = (newSortBy, oldSortBy, currentOrder) =>{

    let newOrder = "asc";

    if(newSortBy === oldSortBy){
        newOrder = (currentOrder === "asc") ? "desc" : "asc";
    }

    return newOrder;
}

const reducer = (state, action) =>{

    switch(action.type){

        case "changeLoading": {
            return {
                ...state,
                "bLoading": action.value
            }
        }

        case "changeOrder": {
            return {
                ...state,
                "order": action.order
            }
        }

        case "setSearchResult": {

            return {
                ...state,
                "totalMatches": action.totalMatches,
                "searchResult": action.searchResult
            }
        }

        case "changeName": {
            return {
                ...state,
                "nameSearch": action.name
            }
        }

        case "changeCountry": {
            return {
                ...state,
                "selectedCountry": action.name
            }
        }

        case "changeActiveRange": {
            return {
                ...state,
                "activeRange": action.value
            }
        }
        case "changeSortBy": {
            return {
                ...state,
                "sortBy": action.value
            }
        }

        case "changeSortByAlt": {

            const newOrder = setOrder(action.value, state.sortBy, state.order);

            return {
                ...state,
                "sortBy": action.value,
                "order": newOrder
            }
        }

        case "changePerPage": {
            return {
                ...state,
                "perPage": action.value
            }
        }
    }

    return state;
}



const setURL = (router, state, forceKeyName, forceKeyValue) => {

    const query = {
        "name": state.nameSearch,
        "country": state.selectedCountry,
        "active": state.activeRange,
        "pp": state.perPage,
        "sb": state.sortBy,
        "o": state.order
    };

    if(forceKeyName !== undefined){
        query[forceKeyName] = forceKeyValue;
    }

    router.push({
        pathname: "/players",
        query
      }, 
      undefined, { shallow: true });
}


const createDescription = (state, page) =>{

    let totalPages = 1;

    if(state.totalMatches > 0 && state.perPage > 0){
        totalPages = Math.ceil(state.totalMatches / state.perPage);
    }

    let description = `Search for a player here, viewing page ${page} of ${totalPages} from a total of ${state.totalMatches} players.`;
    console.log(state.activeRange);
    if(state.nameSearch === "" && state.selectedCountry === "" && state.activeRange === 0) return description;


    description = `Player search result for `;
    
    let bNeedComma = false;

    if(state.nameSearch !== ""){
        description += `name matching "${state.nameSearch}"`;
        bNeedComma = true;
    }

    if(state.selectedCountry !== ""){
        const cInfo = Countires(state.selectedCountry);
        description += `${(bNeedComma) ? ", " : "" }country matching ${cInfo.country}`;
        bNeedComma = true;
    }

    if(state.activeRange != 0){

        let subString = "";

        if(state.activeRange == 1) subString = "past 24 hours";
        if(state.activeRange == 2) subString = "past 7 days";
        if(state.activeRange == 3) subString = "past 28 days";
        if(state.activeRange == 4) subString = "past 365 days";

        description += `${(bNeedComma) ? ", " : "" }active in the last ${subString}`;
        bNeedComma = true;
        
    }

    return `${description}, viewing page ${page} of ${totalPages} from a total of ${state.totalMatches} matching players.`;
}

const loadData = async (signal, dispatch, nDispatch, nameSearch, page, perPage, activeRange, selectedCountry, sortBy, order) =>{


    dispatch({"type": "changeLoading", "value": true});

    try{

        const req = await fetch("/api/playersearch", {
            "signal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "search",
                "name": nameSearch,
                "activeRange": activeRange,
                "country": selectedCountry,
                "page": page,
                "perPage": perPage,
                "order": order,
                "sortBy": sortBy
            })
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            dispatch({"type": "changeLoading", "value": false});
            return;
        }

        dispatch({"type": "setSearchResult", "totalMatches": res.totalMatches, "searchResult": res.data});
        dispatch({"type": "changeLoading", "value": false});
        console.log(res);

    }catch(err){
        if(err.name === "AbortError") return;
        console.trace(err);
    }
}

const renderTable = (state, dispatch, router) =>{


    const headers = [
        {
            "title": "name", 
            "display": "Name", 
            "onClick": () => { 
                const newOrder = setOrder("name", state.sortBy, state.order);
                dispatch({"type": "changeSortByAlt", "value": "name"});
                setURL(router, state, "o", newOrder);
                setURL(router, state, "sb", "name");
            }
        },
        {
            "title": "last", 
            "display": "Last Active", 
            "onClick": () => { 
                const newOrder = setOrder("last", state.sortBy, state.order);
                dispatch({"type": "changeSortByAlt", "value": "last"});
                setURL(router, state, "o", newOrder);
                setURL(router, state, "sb", "last");
            }
        },
        {
            "title": "playtime", 
            "display": "Playtime", 
            "mouseOver": {
                "title": "Total Playtime",
                "content": "This does not include spectator time."
            },
            "onClick": () => { 
                const newOrder = setOrder("playtime", state.sortBy, state.order);
                dispatch({"type": "changeSortByAlt", "value": "playtime"});
                setURL(router, state, "o", newOrder);
                setURL(router, state, "sb", "playtime");
            }
        },
        {
            "title": "matches", 
            "display": "Matches",
            "onClick": () => { 
                const newOrder = setOrder("matches", state.sortBy, state.order);
                dispatch({"type": "changeSortByAlt", "value": "matches"});
                setURL(router, state, "o", newOrder);
                setURL(router, state, "sb", "matches");
            }
        },
        {
            "title": "kills", 
            "display": "Kills",
            "onClick": () => { 
                const newOrder = setOrder("kills", state.sortBy, state.order);
                dispatch({"type": "changeSortByAlt", "value": "kills"});
                setURL(router, state, "o", newOrder);
                setURL(router, state, "sb", "kills");
            }
        },
        {
            "title": "score", 
            "display": "Score", 
            "onClick": () => { 
                const newOrder = setOrder("score", state.sortBy, state.order);
                dispatch({"type": "changeSortByAlt", "value": "score"});
                setURL(router, state, "o", newOrder);
                setURL(router, state, "sb", "score");
            }
        },
        
    ];


    return <div className="m-top-25">
        <CustomTable width={1} 
            headers={headers}
            data={state.searchResult.map((d) =>{
                return {
                    "name": {
                        "value": "", 
                        "displayValue": <Link href={`/player/${d.id}`}><CountryFlag country={d.country}/>{d.name}</Link>,
                        "className": "text-left"
                    },
                    "last": {"value": d.last, "displayValue": convertTimestamp(d.last, true), "className": "playtime"},
                    "playtime": {"value": d.playtime, "displayValue": toPlaytime(d.playtime), "className": "playtime"},
                    "matches": {"value": d.matches, "displayValue": d.matches},
                    "kills": {"value": d.kills, "displayValue": d.kills},
                    "score": {"value": d.score, "displayValue": d.score},
                    
                };
            })}
        />
    </div>
}

const PlayersPage = ({host, session, pageSettings, navSettings, nameSearch, selectedCountry, 
    activeRange, displayType, page, perPage, sortBy, order, totalMatches}) =>{

    const router = useRouter();
    session = JSON.parse(session);

    const [state, dispatch] = useReducer(reducer, {
        "nameSearch": nameSearch,
        "playerList": [],
        "selectedCountry": selectedCountry,
        "activeRange": activeRange,
        "displayType": displayType,
        "bLoading": true,
        "perPage": perPage,
        "totalMatches": totalMatches,
        "searchResult": [],
        "sortBy": sortBy,
        "order": order
    });

    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);

    let title = "Player Search";

    if(state.nameSearch !== ""){
        title = `Player Search Results for "${state.nameSearch}"`;
    }

    useEffect(() =>{

        const controller = new AbortController();

        loadData(
            controller.signal, 
            dispatch, 
            nDispatch, 
            state.nameSearch, 
            page, 
            state.perPage,
            state.activeRange,
            state.selectedCountry,
            state.sortBy,
            state.order,
            
        );

        return () =>{
            controller.abort();
        }

    }, [
        state.nameSearch, 
        page, 
        state.perPage,
        state.activeRange,
        state.selectedCountry,
        state.sortBy,
        state.order
    ]);

    let searchURL = `/players?name=${state.nameSearch}&pp=${state.perPage}&sb=${state.sortBy}&o=${state.order}&active=${state.activeRange}&page=`;

    const description = createDescription(state, page);
    

    return <>
        <DefaultHead 
            host={host} 
            title={title} 
            description={description} 
            keywords={`search,players,player,ut,stats`}
        />
        
        <main>
        <Nav settings={navSettings} session={session}/>
        <div id="content">
            <div className="default">
                <div className="default-header">
                    Players
                </div>
                <div className="form">
                    <div className="form-row">
                        <div className="form-label">Player Name</div>
                        <input 
                            type="text" 
                            className="default-textbox" 
                            placeholder="Player name..." 
                            value={state.nameSearch}
                            onChange={(e) =>{
                         
                                dispatch({"type": "changeName", "name": e.target.value});
                                
                                setURL(router, state, "name", e.target.value);
                            }}
                        />
                    </div>
                    <CountriesListDropDown 
                        dName="Country" 
                        data={[
                            {"displayValue": "test", "value": 0}
                        ]}
                        originalValue={state.selectedCountry}
                        changeSelected={(name,value) =>{
                            
                            dispatch({"type": "changeCountry", "name": value});
                                
                            setURL(router, state, "country", value);
                        }}
                    />
   
                    <DropDown
                        dName="Active In"
                        data={[
                            {"displayValue": "All Time", "value": "0"},
                            {"displayValue": "Past 24 Hours", "value": "1"},
                            {"displayValue": "Past 7 Days", "value": "2"},
                            {"displayValue": "Past 28 Days", "value": "3"},
                            {"displayValue": "Past Year", "value": "4"},
                        ]}
                        originalValue={state.activeRange}
                        changeSelected={(name, value) => {
                            dispatch({"type": "changeActiveRange", "value": value});
                            setURL(router, state, "active", value);
                        }}
                    />
                    <DropDown 
                        dName="Display Type"
                        data={[
                            {"displayValue": "Default View", "value": "0"},
                            {"displayValue": "Table View", "value": "1"},
                        ]}
                        originalValue={state.displayType}
                        changeSelected={(name, value) => {
                            dispatch({"type": "changeDisplay", "value": value});
                            setURL(router, state, "display", value);
                        }}
                    />

                    <DropDown 
                        dName="Sort By"
                        data={[
                            {"displayValue": "Name", "value": "name"},
                            {"displayValue": "Playtime ", "value": "playtime"},
                            {"displayValue": "Matches ", "value": "matches"},
                            {"displayValue": "Score ", "value": "score"},
                            {"displayValue": "Kills ", "value": "kills"},
                            {"displayValue": "Last Active ", "value": "last"},
                        ]}
                        originalValue={state.sortBy}
                        changeSelected={(name, value) => {
                            dispatch({"type": "changeSortBy", "value": value});
                            setURL(router, state, "sb", value);
                        }}
                    />

                    <DropDown 
                        dName="Order"
                        data={[
                            {"displayValue": "ASC", "value": "asc"},
                            {"displayValue": "DESC ", "value": "desc"},
             
                        ]}
                        originalValue={state.order}
                        changeSelected={(name, value) => {
                            dispatch({"type": "changeOrder", "order": value});
                            setURL(router, state, "o", value);
                        }}
                    />

                    <PerPageDropDown 
                        changeSelected={(name, value) => {
                            dispatch({"type": "changePerPage", "value": value});
                            setURL(router, state, "pp", value);
                        }}
                        originalValue={state.perPage}
                    />
                </div>
                <NotificationsCluster 
                    width={1}
                    notifications={nState.notifications} 
                    hide={(id) => nDispatch({"type": "delete", "id": id})}
                    clearAll={() => nDispatch({"type": "clearAll"})}
                />
                <Pagination url={searchURL} perPage={state.perPage} currentPage={page} results={state.totalMatches}/>
                {renderTable(state, dispatch, router)}
                <Pagination url={searchURL} perPage={state.perPage} currentPage={page} results={state.totalMatches}/>
                <Loading value={!state.bLoading}/>
            </div>
        </div>
        <Footer session={session}/>
        </main>   
    </>
}

export async function getServerSideProps({req, query}){

    const session = new Session(req);
    await session.load();

    const settings = new SiteSettings();

    const navSettings = await settings.getCategorySettings("Navigation");
    const pageSettings = await settings.getCategorySettings("Players Page");

    const nameSearch = (query.name !== undefined) ? query.name : "";
    const selectedCountry = (query.country !== undefined) ? query.country : "";
    const activeRange = (query.active !== undefined) ? query.active : 0;
    const displayType = (query.display !== undefined) ? query.display : "";
    const perPage = (query.pp !== undefined) ? query.pp : 25;
    const page = (query.page !== undefined) ? cleanInt(query.page, 1, null) : 1;
    const sortBy = (query.sb !== undefined) ? query.sb : "name";
    let order = (query.o !== undefined) ? query.o.toLowerCase() : "asc";

    if(order !== "asc" && order !== "desc") order = "asc";

    const horseNoise = new PlayerSearch();

    const totalMatches = await horseNoise.getTotalMatches(nameSearch, page, perPage, selectedCountry, activeRange, sortBy, order);

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

    return {
        "props": {
            "session": JSON.stringify(session.settings),
            navSettings,
            pageSettings,
            "host": req.headers.host,
            nameSearch,
            selectedCountry,
            activeRange,
            displayType,
            perPage,
            page,
            sortBy,
            order,
            totalMatches
        }
    }
}


export default PlayersPage;