import {useEffect, useReducer, useState} from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import Tabs from "../Tabs";
import PlayerCTFSummaryGeneral from "../PlayerCTFSummaryGeneral";
import PlayerCTFSummaryCovers from "../PlayerCTFSummaryCovers";
import PlayerCTFSummaryCarry from "../PlayerCTFSummaryCarry";
import PlayerCTFSummaryReturns from "../PlayerCTFSummaryReturns";

const getTabs = () =>{

    const tabs = [
        {"name": "General", "value": 0},
        {"name": "Covers", "value": 1},
        {"name": "Carry Stats", "value": 2},
        {"name": "Returns", "value": 3}
    ];

    return tabs;
}

const reducer = (state, action) =>{

    switch(action.type){

        case "loaded": {
            return {
                "bLoading": false,
                "error": null,
                "totals": action.totals,
                "best": action.best,
                "bestLife": action.bestLife,
                "gametypeNames": action.gametypeNames
            };
        }
        case "error": {
            return {
                "bLoading": false,
                "error": action.errorMessage
            }
        }
    }

    return state;
}

const renderGeneral = (selectedTab, recordType, gametypeNames, data) =>{

    if(selectedTab !== 0) return null;

    return <PlayerCTFSummaryGeneral gametypeNames={gametypeNames} data={data} recordType={recordType}/>
}

const renderCovers = (selectedTab, recordType, gametypeNames, data) =>{

    if(selectedTab !== 1) return null;

    return <PlayerCTFSummaryCovers gametypeNames={gametypeNames} data={data} recordType={recordType}/>;
}

const renderCarry = (selectedTab, recordType, gametypeNames, data) =>{

    if(selectedTab !== 2) return null;

    return <PlayerCTFSummaryCarry gametypeNames={gametypeNames} data={data} recordType={recordType}/>
}

const renderReturns = (selectedTab, recordType, gametypeNames, data) =>{

    if(selectedTab !== 3) return null;

    return <PlayerCTFSummaryReturns gametypeNames={gametypeNames} data={data} recordType={recordType}/>;
}


const bAnyData = (state) =>{

    const keys = ["totals", "best", "bestLife"];

    for(let i = 0; i < keys.length; i++){

        if(state[keys[i]].length > 0) return true;
    }

    return false;
}

const PlayerCTFSummary = ({playerId}) =>{

    const [state, dispatch] = useReducer(reducer, {
        "bLoading": true,
        "error": null,
        "totals": [],
        "best": [],
        "bestLife": [],
        "gametypeNames": {}
    });

    const [selectedMode, setSelectedMode] = useState(0);
    const [recordType, setRecordType] = useState(0);

    useEffect(() =>{
        
        const controller = new AbortController();

        const loadData = async () =>{

            try{

                const req = await fetch("/api/player", {
                    "signal": controller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode": "ctf", "playerId": playerId})
                });

                const res = await req.json();

                if(res.error !== undefined){
                    dispatch({"type": "error", "errorMessage": res.error});
                }else{
                    dispatch({
                        "type": "loaded", 
                        "totals": res.totals, 
                        "best": res.best, 
                        "bestLife": res.bestLife,
                        "gametypeNames": res.gametypeNames
                    });
                }

            }catch(err){

                if(err.name === "AbortError") return;
                console.trace(err);
            }

        }

        loadData();

        return () =>{
            controller.abort();
        }
    }, [playerId]);


    if(state.bLoading) return <Loading />;
    if(state.error !== null) return <ErrorMessage title="Capture The Flag Summary" text={state.error}/>

    const options = [
        {"name": "Totals", "value": 0},
        {"name": "Gametypes", "value": 1},
        {"name": "Match Records", "value": 2},
        {"name": "Single Life Records", "value": 3}
    ];

    let data = [];

    if(recordType < 2) data = state.totals;
    if(recordType === 2) data = state.best;
    if(recordType === 3) data = state.bestLife;


    if(!bAnyData(state)) return null;

    return <div>
        <div className="default-header">Capture The Flag Summary</div>
        <Tabs selectedValue={selectedMode} options={getTabs()} changeSelected={setSelectedMode}/>
        <Tabs options={options} selectedValue={recordType} changeSelected={setRecordType}/> 
    
        
    
        {renderGeneral(selectedMode, recordType, state.gametypeNames, data)}
        {renderCovers(selectedMode, recordType, state.gametypeNames, data)}
        {renderCarry(selectedMode, recordType, state.gametypeNames, data)}
        {renderReturns(selectedMode, recordType, state.gametypeNames, data)}
    </div>
}

export default PlayerCTFSummary;