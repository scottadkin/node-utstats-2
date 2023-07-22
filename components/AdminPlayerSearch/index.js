import Tabs from "../Tabs";
import { useReducer, useEffect } from "react";
import InteractivePlayerSearchBox from "../InteractivePlayerSearchBox";
import Loading from "../Loading";
import NotificationsCluster from "../NotificationsCluster";
import useNotificationCluster from "../useNotificationCluster";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import { convertTimestamp, toPlaytime } from "../../api/generic.mjs";
import AdminPlayerHistory from "../AdminPlayerHistory";

const reducer = (state, action) =>{

    switch(action.type){

        case "changeTab": {
            return {
                ...state,
                "selectedTab": action.tab
            }
        }

        case "loadedPlayerList": {
            return {
                ...state,
                "playerNames": action.players,
                "bLoading": false
            }
        }

        case "updateSearchName": {
            return {
                ...state,
                "nameSearch": action.value
            }
        }

        case "setSearchResult": {
            return {
                ...state,
                "searchResult": action.result
            }
        }

        case "setSelectedPlayer": {
            return {
                ...state,
                "selectedPlayerProfile": action.playerId
            }
        }

        case "toPlayerReport": {
            return {
                ...state,
                "selectedPlayerProfile": action.playerId,
                "selectedTab": 3
            }
        }
    }
    return state;
}

const nameSearch = async (state, dispatch, addNotification) =>{

    try{

        const controller = new AbortController();

        const req = await fetch("/api/adminplayers", {
            "headers": {"Content-type": "application/json"},
            "signal": controller.signal,
            "method": "POST",
            "body": JSON.stringify({"mode": "namesearch", "name": state.nameSearch})
        });

        const res = await req.json();

        if(res.error !== undefined){

            addNotification("error", res.error);
            return;
        }


        dispatch({"type": "setSearchResult", "result": res.names});

        console.log(res);

    }catch(err){

        console.trace(err);
    }
}


const renderNameSearch = (state, dispatch, addNotification) =>{

    if((state.selectedTab !== 0 && state.selectedTab !== 3) || state.bLoading) return null;

    console.log(state.playerNames);
    return <div className="form">
        <div className="form-info">
            Search for a player by name.
        </div>
        <div className="form-row">
            <div className="form-label">Player Name</div>
            <InteractivePlayerSearchBox 
                searchValue={state.nameSearch} 
                setSearchValue={(value) =>{
                    console.log(value);
                    dispatch({"type": "updateSearchName", "value": value})
                    
                }}
                data={state.playerNames} 
                maxDisplay={50} 
                selectedPlayers={[]}
                bAutoSet={true}
                togglePlayer={(id) =>{
                    dispatch({"type": "setSelectedPlayer", "playerId": id});
                }}
                
            />
        </div>
        <div className="search-button" onClick={() =>{
            nameSearch(state, dispatch, addNotification);
        }}>Search</div>
    </div>
    
}
//data, maxDisplay, searchValue, selectedPlayers, togglePlayer, setSearchValue, bAutoSet

const loadData = async (controller, dispatch) =>{

    try{

        const req = await fetch("/api/adminplayers", {
            "headers": {"Content-type": "application/json"},
            "signal": controller.signal,
            "method": "POST",
            "body": JSON.stringify({"mode": "player-list"})
        });

        const res = await req.json();

        if(res.error === undefined){

            dispatch({"type": "loadedPlayerList", "players": res.players});

            console.log(res);
            return;
        }   

    }catch(err){

        if(err.name === "AbortError") return;
        console.trace(err);
    }
}

const renderSearchResult = (state, dispatch) =>{

    if(state.selectedTab !== 0) return null;

    const headers = {
        "name": "Name",
        "ip": "Last Used IP",
        "hwid": "Latest HWID",
        "first": "First Seen",
        "last": "Last Seen",
        "playtime": "Playtime",
        "action": "Actions"
    };

    console.log(state.searchResult);

    const data = state.searchResult.map((d) =>{

        return {
            "name": {
                "value": d.name.toLowerCase(), 
                "displayValue": <><CountryFlag country={d.country}/>{d.name}</>,
                "className": "text-left"
            },
            "ip": {"value": d.ip},
            "hwid": {"value": d.hwid},
            "first": {"value": d.first, "displayValue": convertTimestamp(d.first, true)},
            "last": {"value": d.last, "displayValue": convertTimestamp(d.last, true)},
            "playtime": {
                "value": d.playtime, 
                "displayValue": toPlaytime(d.playtime),
                "className": "playtime"
            },
            "action": {
                "value": "",
                "displayValue": <div onClick={() =>{
                    dispatch({"type": "toPlayerReport", "playerId": d.id});
                }}>View History</div>
            }
        }
    });

    return <>
        <div className="default-header">Search Result</div>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </>
}

const renderHistory = (state) =>{

    if(state.selectedTab !== 3) return null;

    return <AdminPlayerHistory playerNames={state.playerNames} selectedPlayerProfile={state.selectedPlayerProfile}/>;
}

const AdminPlayerSearch = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true, 
        "playerNames": [], 
        "selectedTab": 0,
        "nameSearch": "",
        "searchResult": [],
        "selectedPlayerProfile": -1
    });

    const [notifications, addNotification, hideNotification, clearAllNotifications] = useNotificationCluster();

    useEffect(() =>{

        const controller = new AbortController();

        loadData(controller, dispatch);

        return () =>{
            controller.abort();
        }

    },[]);


    const tabOptions = [
        {"value": 0, "name": "Name Search"},
        {"value": 1, "name": "IP Search"},
        {"value": 2, "name": "HWID Search"},
        {"value": 3, "name": "Player Report"},
    ];

    return <div>
        <div className="default-header">Player Search</div>
        <Tabs options={tabOptions} selectedValue={state.selectedTab} changeSelected={(value) =>{
            dispatch({"type": "changeTab", "tab": value});
        }}/>
        <Loading value={!state.bLoading}/>
        <NotificationsCluster notifications={notifications} hide={hideNotification}/>
        {renderNameSearch(state, dispatch, addNotification)}
        {renderSearchResult(state, dispatch)}
        {renderHistory(state)}
    </div>
}

export default AdminPlayerSearch;