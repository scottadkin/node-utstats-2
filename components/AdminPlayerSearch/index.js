import Tabs from "../Tabs";
import { useReducer, useEffect } from "react";
import InteractivePlayerSearchBox from "../InteractivePlayerSearchBox";
import Loading from "../Loading";

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
    }
    return state;
}


const renderNameSearch = (state, dispatch) =>{

    if(state.selectedTab !== 0 || state.bLoading) return null;

    console.log(state.playerNames);
    return <>
        <div className="form">
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
            />
            </div>
            <div className="search-button">Search</div>
        </div>
    </>
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

const AdminPlayerSearch = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true, 
        "playerNames": [], 
        "selectedTab": 0,
        "nameSearch": ""
    });

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
    ];

    return <div>
        <div className="default-header">Player Search</div>
        <Tabs options={tabOptions} selectedValue={state.selectedTab} changeSelected={(value) =>{
            dispatch({"type": "changeTab", "tab": value});
        }}/>
        <Loading value={!state.bLoading}/>
        {renderNameSearch(state, dispatch)}
        

    </div>
}

export default AdminPlayerSearch;