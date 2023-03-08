import { useEffect, useReducer } from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import Functions from "../../api/functions";
import DropDown from "../DropDown";

const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                "bLoading": false,
                "loadError": null,
                "playersList": action.players,
                "hwidList": action.hwids
            }
        }
        case "loadError": {
            return {
                ...state,
                "bLoading": false,
                "loadError": action.errorMessage
            }
        }
        case "changeSelectedHWID": {
            return {
                ...state,
                "selectedHWID": action.hwid
            }
        }
        case "setSelectedPlayerIds": {
            return {
                ...state,
                "selectedPlayerIds": action.selectedPlayerIds
            }
        }
    }

    return state;
}

const renderPlayers = (state, dispatch) =>{

    const headers = {
        "name": "Player",
        "hwid": "HWID",
        "matches": "Matches",
        "last": "Last Seen"
    };

    const data = state.playersList.map((player) =>{

        return {
            "name": {
                "value": player.name.toLowerCase(),
                "displayValue": <><CountryFlag country={player.country}/>{player.name}</>,
                "className": "text-left"
            },
            "hwid": {
                "value": player.hwid
            },
            "matches": {
                "value": player.matches
            },
            "last": {
                "value": player.last,
                "displayValue": Functions.convertTimestamp(player.last, true)
            },
            
        }
    });


    return <InteractiveTable width={1} headers={headers} data={data}/>
}

const createPlayerDropDown = (state) =>{

    return state.hwidList.map((player) =>{
        return {"value": player.hwid, "displayValue": <><CountryFlag country={player.country}/>{player.name} - <b>{player.hwid}</b></>};
    });
}

const renderForm = (state, dispatch) =>{

    return <div className="form m-bottom-10">
        <div className="default-sub-header">Set Player HWIDs</div>
        <DropDown 
            dName="HWID" 
            fName="selectedHWID" 
            originalValue={-1} 
            data={createPlayerDropDown(state)} 
            changeSelected={(name, value) =>{
                dispatch({"type": "changeSelectedHWID", "hwid": value});
            }}
        />
        <div className="form-info">
            Click on a player&apos;s name below, to add to a list of players you would like to use the HWID specified above.
        </div>
    </div>
}

const AdminPlayerHWIDMerge = ({}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "loadError": null,
        "playersList": [],
        "hwidsList": [],
        "selectedHWID": -1
    });


    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/adminplayers",{
                "signal": controller.signal,
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "players-hwid-list"})
            });

            const res = await req.json();

            if(res.error !== undefined){
                dispatch({"type": "loadError", "errorMessage": res.error});
                return;
            }

            dispatch({"type": "loaded", "players": res.players, "hwids": res.hwidList});
        }

        loadData();

        return () => controller.abort();
    }, []);

    if(state.bLoading) return <Loading />;
    if(state.loadError !== null) return <ErrorMessage title={"Merge Player By HWID"} text={state.loadError}/>
    
    return <div>
        <div className="default-header">Merge Player By HWID</div>
        {renderForm(state, dispatch)}
        {renderPlayers(state, dispatch)}
    </div>
}

export default AdminPlayerHWIDMerge;