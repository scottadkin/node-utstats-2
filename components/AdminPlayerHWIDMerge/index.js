import { useEffect, useReducer } from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import Tabs from "../Tabs";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import Functions from "../../api/functions";

const reducer = (state, action) =>{

    switch(action.type){
        case "loaded": {
            return {
                "bLoading": false,
                "loadError": null,
                "playersList": action.players
            }
        }
        case "loadError": {
            return {
                ...state,
                "bLoading": false,
                "loadError": action.errorMessage
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
                "displayValue": <><CountryFlag country={player.country}/>{player.name}</>
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

const AdminPlayerHWIDMerge = ({}) =>{


    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "loadError": null,
        "playersList": []
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

            dispatch({"type": "loaded", "players": res.players});
        }

        loadData();

        return () => controller.abort();
    }, []);

    if(state.bLoading) return <Loading />;
    if(state.loadError !== null) return <ErrorMessage title={"Merge Player By HWID"} text={state.loadError}/>
    
    return <div>
        <div className="default-header">Merge Player By HWID</div>
        {renderPlayers(state, dispatch)}
    </div>
}

export default AdminPlayerHWIDMerge;