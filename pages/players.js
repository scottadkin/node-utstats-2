import Session from "../api/session";
import Analytics from "../api/analytics";
import SiteSettings from "../api/sitesettings";
import DefaultHead from "../components/defaulthead";
import Footer from "../components/Footer";
import Nav from "../components/Nav";
import { useReducer, useEffect } from "react";
import { useRouter } from "next/router";
import CountriesListDropDown from "../components/CountriesListDropDown";
import DropDown from "../components/DropDown";
import NotificationsCluster from "../components/NotificationsCluster";
import {notificationsInitial, notificationsReducer} from "../reducers/notificationsReducer";
import Loading from "../components/Loading";

const reducer = (state, action) =>{

    switch(action.type){

        case "changeLoading": {
            return {
                ...state,
                "bLoading": action.value
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
    }

    return state;
}

const setURL = (router, state, forceKeyName, forceKeyValue) => {

    const query = {
        "name": state.nameSearch,
        "country": state.selectedCountry,
        "active": state.activeRange
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


const loadData = async (signal, dispatch, nDispatch, state) =>{


    dispatch({"type": "changeLoading", "value": true});

    try{

        const req = await fetch("/api/playersearch", {
            "signal": signal,
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "search",
                "name": state.nameSearch,
                "action": state.activeRange,
                "country": state.selectedCountry
            })
        });

        const res = await req.json();

        if(res.error !== undefined){
            nDispatch({"type": "add", "notification": {"type": "error", "content": res.error}});
            return;
        }

    }catch(err){
        console.trace(err);
    }

    
}

const PlayersPage = ({host, session, pageSettings, navSettings, nameSearch, selectedCountry, activeRange, displayType}) =>{

    const router = useRouter();
    session = JSON.parse(session);

    console.log(`selectedCountry = ${selectedCountry}`);

    const [state, dispatch] = useReducer(reducer, {
        "nameSearch": nameSearch,
        "playerList": [],
        "selectedCountry": selectedCountry,
        "activeRange": activeRange,
        "displayType": displayType,
        "bLoading": true
    });

    const [nState, nDispatch] = useReducer(notificationsReducer, notificationsInitial);

    let title = "Player Search";

    if(state.nameSearch !== ""){
        title = `Player Search Results for "${state.nameSearch}"`;
    }

    useEffect(() =>{

        const controller = new AbortController();

        loadData(controller.signal, dispatch, nDispatch, state);

        return () =>{
            controller.abort();
        }
    }, []);

    return <>
        <DefaultHead 
            host={host} 
            title={title} 
            description={`Viewing players  page  of , players  to  out of a possible  players.`} 
            keywords={`search,players,player`}
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
                    <div className="search-button">Search</div>
                </div>
                <NotificationsCluster 
                    notifications={nState.notifications} 
                    hide={(id) => nDispatch({"type": "hide", "id": id})}
                    clearAll={() => nDispatch({"type": "clearAll"})}
                />
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

    console.log(query);

    const nameSearch = (query.name !== undefined) ? query.name : "";
    const selectedCountry = (query.country !== undefined) ? query.country : "";
    const activeRange = (query.active !== undefined) ? query.active : "";
    const displayType = (query.display !== undefined) ? query.display : "";


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
            displayType
        }
    }
}


export default PlayersPage;