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
import Link from "next/link";

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
        case "setIpSearch": {
            return {
                ...state,
                "ipSearch": action.value
            }
        }
        case "setIpSearchResult": {
            return {
                ...state,
                "ipSearchResult": action.data
            }
        }
        case "setHWIDSearch": {
            return {
                ...state,
                "hwidSearch": action.value
            }
        }
        case "setHWIDSearchResult": {
            return {
                ...state,
                "hwidSearchResult": action.data
            }
        }
    }
    return state;
}

const nameSearch = async (state, dispatch, addNotification, overrideValue) =>{

    try{

        const controller = new AbortController();

        const nameSearch = (overrideValue !== undefined) ? overrideValue : state.nameSearch;

        const req = await fetch("/api/adminplayers", {
            "headers": {"Content-type": "application/json"},
            "signal": controller.signal,
            "method": "POST",
            "body": JSON.stringify({"mode": "namesearch", "name": nameSearch})
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

    if((state.selectedTab !== 0) || state.bLoading) return null;

    return <div className="form">
        <div className="form-info">
            Search for a player by name.
        </div>
        <div className="form-row">
            <div className="form-label">Player Name</div>
            <InteractivePlayerSearchBox 
                searchValue={state.nameSearch} 
                setSearchValue={(value) =>{
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


const ipSearch = async (state, dispatch, addNotification, overrideValue) =>{

    try{

        const ipSearch = (overrideValue !== undefined) ? overrideValue : state.ipSearch;

        const req = await fetch("/api/adminplayers",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "ipSearch", "ip": ipSearch})
        });

        const res = await req.json();

        if(res.error !== undefined){
            throw new Error(res.error);
        }
        

        dispatch({"type": "setIpSearchResult", "data": res});

        console.log(res);
    }catch(err){
        console.log(err);
        addNotification("error", <>{err.toString()}</>);
    }
}

const hwidSearch = async (state, dispatch, addNotification, overrideValue) =>{

    try{

        const hwidSearch = (overrideValue !== undefined) ? overrideValue : state.hwidSearch;

        const req = await fetch("/api/adminplayers",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "hwidSearch", "hwid": hwidSearch})
        });

        const res = await req.json();

        if(res.error !== undefined){
            throw new Error(res.error);
        }
        
        dispatch({"type": "setHWIDSearchResult", "data": res});

        console.log(res);
    }catch(err){
        console.log(err);
        addNotification("error", <>{err.toString()}</>);
    }
}

const renderIPSearch = (state, dispatch, addNotification) =>{

    if((state.selectedTab !== 1) || state.bLoading) return null;

    return <div className="form">
        <div className="form-info">
            Search for a player by ip.
        </div>
        <div className="form-row">
            <div className="form-label">Player IP</div>
            <input type="text" 
                className="default-textbox" 
                value={state.ipSearch} 
                placeholder="Player IP..."
                onChange={(e) =>{ console.log(e.target.value);dispatch({"type": "setIpSearch", "value": e.target.value})}}
            />
        </div>
        <div className="search-button" onClick={() =>{
            ipSearch(state, dispatch, addNotification);
        }}>Search</div>
    </div>   
}

const renderHWIDSearch = (state, dispatch, addNotification) =>{

    if((state.selectedTab !== 2) || state.bLoading) return null;

    return <div className="form">
        <div className="form-info">
            Search for a player by HWID.
        </div>
        <div className="form-row">
            <div className="form-label">Player HWID</div>
            <input type="text" 
                className="default-textbox" 
                value={state.hwidSearch} 
                placeholder="Player HWID..."
                onChange={(e) =>{ console.log(e.target.value);dispatch({"type": "setHWIDSearch", "value": e.target.value})}}
            />
        </div>
        <div className="search-button" onClick={() =>{
            hwidSearch(state, dispatch, addNotification);
        }}>Search</div>
    </div>   
}

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

const renderSearchResult = (state, dispatch, addNotification) =>{

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

    const data = state.searchResult.map((d) =>{

        return {
            "name": {
                "value": d.name.toLowerCase(), 
                "displayValue": <>
                    <CountryFlag country={d.country}/>
                    <span onClick={() =>{
                        dispatch({"type": "updateSearchName", "value": d.name});
                        dispatch({"type": "changeTab", "tab": 0});
                        console.log(d.name);
                        nameSearch(state, dispatch, addNotification, d.name);
                    }}>
                        {d.name}
                    </span>
                </>,
                "className": "text-left hover"
            },
            "ip": {
                "value": d.ip, 
                "displayValue": <span onClick={() => {
                    dispatch({"type": "setIpSearch", "value": d.ip});
                    dispatch({"type": "changeTab", "tab": 1});
                    ipSearch(state, dispatch, addNotification, d.ip);
                }}>{d.ip}</span>,
                "className": "hover"
            },
            "hwid": {
                "value": d.hwid, 
                "displayValue": <span onClick={() =>{
                    dispatch({"type": "setHWIDSearch", "value": d.hwid});
                    dispatch({"type": "changeTab", "tab": 2});
                    hwidSearch(state, dispatch, addNotification, d.hwid);
                }}>{d.hwid}</span>,
            "className": "hover"},
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
                }}>View History</div>,
                "className": "hover"
            }
        }
    });

    return <>
        <div className="default-header">Search Result</div>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </>
}

const renderHistory = (state, dispatch) =>{

    if(state.selectedTab !== 3) return null;

    return <AdminPlayerHistory 
        playerNames={state.playerNames} 
        selectedPlayerProfile={state.selectedPlayerProfile}
        setIpSearch={((value) =>{
            dispatch({"type": "setIpSearch", "value": value});
        })}
    />;
}

const renderIPSearchResult = (state, dispatch, addNotification) =>{

    if(state.selectedTab !== 1) return null;

    const headers = {
        "player": "Player",
        "date": "Date",
        "match": "Match Link",
        "actions": "Actions"
    };

    const data = state.ipSearchResult.matchData.map((d) =>{

        const playerName = state.ipSearchResult.playerNames[d.player_id] ?? "Not Found";

        return {
            "player": {
                "value": playerName.toLowerCase(), 
                "displayValue": <Link href={`/player/${d.player_id}`} target="_blank"><CountryFlag country={d.country}/>{playerName}</Link>
            },
            "date": {
                "value": d.match_date, 
                "displayValue": convertTimestamp(d.match_date, true), "className": "playtime"
            },
            "match": {
                "value": d.match_id, 
                "displayValue": <>
                    <Link href={`/match/${d.match_id}`} target="_blank">Match Report</Link><br/>
                    <Link href={`/pmatch/${d.match_id}/?player=${d.player_id}`} target="_blank">Player Match Report</Link>
                </>
            },
            "actions": {
                "displayValue": <>
                    <span onClick={() =>{
                            dispatch({"type": "toPlayerReport", "playerId": d.player_id});
                        }}><a href={`#test`}>View History</a>
                    </span>
                </>,
                "className": "hover"
            }
        }
    });

   const namesHeader = {
        "name": "Name",
        "profile": "Profile Link"
    };

    const namesData = [];

    for(const [id, name] of Object.entries(state.ipSearchResult.playerNames)){
        namesData.push(
                {
                    "name":{ 
                        "value": name.toLowerCase(), 
                        "displayValue": <span onClick={() =>{
                            dispatch({"type": "updateNameSearch", "value": name});
                            dispatch({"type": "changeTab", "tab": 0});
                            nameSearch(state, dispatch, addNotification, name)
                        }}>{name}</span> 
                    }, 
                    "profile": {
                        "displayValue": <Link href={`/player/${id}`} target="_blank" key={id}>View Profile</Link>
                    }
                }
        );
    }


    return <>
        <div className="default-header">Unique Names</div>
        <InteractiveTable width={4} headers={namesHeader} data={namesData}/>
        <div className="default-header">IP Usage</div>
        <InteractiveTable width={4} headers={headers} data={data}/>
    </>
}


const renderHWIDSearchResult = (state, dispatch, addNotification) =>{

    if(state.selectedTab !== 2) return null;

    const headers = {
        "name": "Name",
        "ip": "IP",
        "first": "First Seen",
        "last": "Last Seen",
        "matches": "Total Matches"
    };

    const playerNames = state.hwidSearchResult.playerNames;

    const data = state.hwidSearchResult.data.map((d) =>{

        const playerName = (playerNames[d.player_id] !== undefined) ? playerNames[d.player_id] : "Not Found";

        return {
            "name": {
                "value": playerName.toLowerCase(), 
                "displayValue": <>
                    <CountryFlag country={d.country}/>
                    <span onClick={() =>{
                            dispatch({"type": "updateNameSearch", "value": playerName});
                            dispatch({"type": "changeTab", "tab": 0});
                            nameSearch(state, dispatch, addNotification, playerName)
                        }}>{playerName}
                    </span>
                </>,
                "className": "hover"
                
            },
            "ip": {"value": d.ip, "displayValue": <span onClick={() =>{
                    dispatch({"type": "setIpSearch", "value": d.ip});
                    dispatch({"type": "changeTab", "tab": 1});
                    ipSearch(state, dispatch, addNotification, d.ip)
                }}>
                    {d.ip}
                </span>,
                "className": "hover"}
            ,
            "first": {"value": d.first_match, "displayValue": convertTimestamp(d.first_match, true)},
            "last": {"value": d.last_match, "displayValue": convertTimestamp(d.last_match, true)},
            "matches": {"value": d.total_matches},
        };
    });

    const namesData = [];

    for(const [id, name] of Object.entries(playerNames)){
        namesData.push({
            "name": {
                "value": name.toLowerCase(), 
                "displayValue": <span onClick={() =>{
                    dispatch({"type": "updateNameSearch", "value": name});
                    dispatch({"type": "changeTab", "tab": 0});
                    nameSearch(state, dispatch, addNotification, name)
                }}>{name}</span>,
                "className": "hover"
            },
            "profile": {"value": id, "displayValue": <Link href={`/player/${id}`} target="_blank">View Profile</Link>}
        });
    }

    return <>
        <div className="default-header">Unique Names</div>
        <InteractiveTable width={4} headers={{
            "name": "Name",
            "profile": "Profile Link"
        }} data={namesData}/>
        <div className="default-header">HWID Usage</div>
        <InteractiveTable width={1} headers={headers} data={data}/>
    </>;
}

const AdminPlayerSearch = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true, 
        "playerNames": [], 
        "selectedTab": 0,
        "nameSearch": "",
        "searchResult": [],
        "selectedPlayerProfile": -1,
        "ipSearch": "",
        "ipSearchResult": {"matchData": [], "playerNames": {}},
        "hwidSearch": "",
        "hwidSearchResult": {"data": [], "playerNames": {}}
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
        {renderIPSearch(state, dispatch, addNotification)}
        {renderHWIDSearch(state, dispatch, addNotification)}
        {renderSearchResult(state, dispatch, addNotification)}
        {renderIPSearchResult(state, dispatch)}
        {renderHWIDSearchResult(state, dispatch, addNotification)}
        {renderHistory(state, dispatch, addNotification)}
    </div>
}

export default AdminPlayerSearch;