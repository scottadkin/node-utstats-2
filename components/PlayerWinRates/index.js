import { useEffect, useReducer } from "react";
import Loading from "../Loading";
import InteractiveTable from "../InteractiveTable";
import ErrorMessage from "../ErrorMessage";
import Tabs from "../Tabs";
import { ignore0, convertTimestamp } from "../../api/generic.mjs";
import Dropdown from "../DropDown";

const reducer = (state, action) =>{

	switch(action.type){

		case "error": {
			return {
				...state,
				"bLoading": false,
				"error": action.errorMessage
			}
		}
		case "loaded": {
			return {
				...state,
				"bLoading": false,
				"error": null,
				"data": action.data
			}
		}
        case "changeTab": {
            return {
                ...state,
                "selectedTab": action.tab
            }
        }
        case "changeSelectedGametype": {
            return {
                ...state,
                "selectedGametype": action.option
            }
        }
        case "changeSelectedMap": {
            return {
                ...state,
                "selectedMap": action.option
            }
        }
	}

	return state;
}

const getCurrentStreakString = (data) =>{

    let value = 0;
    let stringName = "";

    if(data.current_win_streak > 0){

        value = data.current_win_streak;

        if(value === 1){
            stringName = "Win";
        }else{
            stringName = "Wins";
        }  
    }

    if(data.current_draws_streak > 0){

        value = data.current_draw_streak;

        if(value === 1){
            stringName = "Draw";
        }else{
            stringName = "Draws";
        }  
    }

    if(data.current_lose_streak > 0){

        value = data.current_lose_streak;

        if(value === 1){
            stringName = "Loss";
        }else{
            stringName = "Losses";
        }  
    } 



    return `${value} ${stringName}`;
}

const sortByName = (a, b) =>{

    a = a.displayValue.toLowerCase();
    b = b.displayValue.toLowerCase();

    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
}

const createDropDownList = (state) =>{

    const uniqueGametypes = new Set();
    const uniqueMaps = new Set();
    uniqueMaps.add(0)

    const gametypeOptions = [
        {"value": -1, "displayValue": "Any"}
    ];

    const mapOptions = [
        {"value": -1, "displayValue": "Any"},
        {"value": 0, "displayValue": "Combined"}
    ];

    for(let i = 0; i < state.data.length; i++){

        const {gametype, gametypeName, map, mapName} = state.data[i];

        if(!uniqueGametypes.has(gametype)){

            uniqueGametypes.add(gametype);
            gametypeOptions.push({"value": gametype, "displayValue": gametypeName});
        }

        if(!uniqueMaps.has(map)){
            
            uniqueMaps.add(map);
            mapOptions.push({"value": map, "displayValue": mapName});
        }
    }

    gametypeOptions.sort(sortByName);
    mapOptions.sort(sortByName);

    return {"gametypes": gametypeOptions, "maps": mapOptions};
}

const renderCustom = (state, dispatch) =>{

    const dropdownOptions = createDropDownList(state);

    const headers = {
        "gametype": "Gametype",
        "map": "Map",
        "last": "Last",
        "matches": "Matches Played",
        "lose": "Losses",
        "draws": "Draws",
        "wins": "Wins",
        "winRate": "Win Rate",
        "lossStreak": "Worst Loss Streak",
        "winStreak": "Best Win Streak",
        "currentStreak": "Current Streak"      
    };

    const tableData = [];

    for(let i = 0; i < state.data.length; i++){

        const d = state.data[i];

        if(d.gametype !== state.selectedGametype && state.selectedGametype !== -1) continue;
        if(d.map !== state.selectedMap && state.selectedMap !== -1) continue;


        tableData.push({
            "gametype": {"value": d.gametypeName.toLowerCase(), "displayValue" : d.gametypeName},
            "map":  {"value": d.mapName.toLowerCase(), "displayValue" : d.mapName},
            "last":  {"value": d.date, "displayValue" : convertTimestamp(d.date, true)},
            "matches":  {"value": d.matches},
            "lose":  {"value": d.losses, "displayValue": ignore0(d.losses)},
            "draws":  {"value": d.draws, "displayValue": ignore0(d.draws)},
            "wins":  {"value": d.wins, "displayValue": ignore0(d.wins)},
            "winRate":  {"value": d.winrate, "displayValue" : `${d.winrate.toFixed(2)}%`},
            "lossStreak":  {"value": ignore0(d.max_lose_streak)},
            "winStreak":  {"value": ignore0(d.max_win_streak)},
            "currentStreak":  {"value": "", "displayValue" : getCurrentStreakString(d)},     
        });
    }
  
    return <>
        <div className="form m-bottom-10">
            <div className="default-sub-header">Filter Win Rates</div>
            <Dropdown 
                dName={"Gametype"} 
                fName={"gametype"} 
                data={dropdownOptions.gametypes} 
                originalValue={state.selectedGametype}
                changeSelected={(name, value) => { 
                    dispatch({"type": "changeSelectedGametype", "option": value})
                }}
            />
            <Dropdown 
                dName={"Map"} 
                fName={"map"} 
                data={dropdownOptions.maps}
                originalValue={state.selectedMap}
                changeSelected={(name, value) => { 
                    dispatch({"type": "changeSelectedMap", "option": value})
                }}
            />
        </div>
        <InteractiveTable width={1} headers={headers} data={tableData} defaultOrder={"matches"} bAsc={false}/>
    </>
}


const renderData = (state, dispatch) =>{

    if(state.bLoading) return null;

    if(state.selectedTab === 2) return renderCustom(state, dispatch);

    const headers = {
        "name": "Name",
        "last": "Last",
        "matches": "Matches Played",
        "lose": "Losses",
        "draws": "Draws",
        "wins": "Wins",
        "winRate": "Win Rate",
        "lossStreak": "Worst Loss Streak",
        "winStreak": "Best Win Streak",
        "currentStreak": "Current Streak"      
    };

    const tableData = [];

    for(let i = 0; i < state.data.length; i++){

        const d = state.data[i];

        if(state.selectedTab === 0 && d.map !== 0) continue;
        if(state.selectedTab === 1 && d.gametype !== 0) continue;

        if(state.selectedTab !== -1 && d.gametype === 0 && d.map === 0) continue;

        if(state.selectedTab === -1 && (d.gametype !== 0 || d.map !== 0)) continue;

        let name = "All";

        if(state.selectedTab === 0) name = d.gametypeName;
        if(state.selectedTab === 1) name = d.mapName;

        tableData.push({
            "name": {
                "value": name.toLowerCase(),
                "displayValue": name,
                "className": "text-left"
            },
            "last": {
                "value": d.date,
                "displayValue": convertTimestamp(d.date, true)
            },
            "matches": {
                "value": d.matches
            },
            "wins": {"value": ignore0(d.wins)},
            "draws": {"value": ignore0(d.draws)},
            "lose": {"value": ignore0(d.losses)},
            "winRate": {"value": d.winrate, "displayValue": `${d.winrate.toFixed(2)}%`},
            "winStreak": {"value": ignore0(d.max_win_streak)},
            "lossStreak": {"value": ignore0(d.max_lose_streak)},
            "currentStreak": {
                "value": 0,
                "displayValue": getCurrentStreakString(d)
            }
        });
    }

    return <>
        <InteractiveTable headers={headers} data={tableData} width={1} defaultOrder={"matches"} bAsc={false}/>
    </>
}


const PlayerWinRates = ({playerId}) =>{

    const [state, dispatch] = useReducer(reducer, {
		"bLoading": true,
		"data": null,
		"error": null,
        "selectedTab": 2,
        "selectedGametype": -1,
        "selectedMap": -1               
	});

	useEffect(() =>{

		const controller = new AbortController();

		async function loadData(){
			
			try{

				const req = await fetch(`/api/player?mode=winrates&playerId=${playerId}`, {
					"signal": controller.signal,
					"method": "GET"
				});

				const res = await req.json();

				if(res.error !== undefined){

					dispatch({"type": "error", "errorMessage": res.error.toString()});
					return;
				}

				dispatch({"type": "loaded", "data": res.data});

			}catch(err){

				if(err.name === "AbortError") return;
                console.trace(err);
                dispatch({"type": "error", "errorMessage": err.toString()});
				
			}
		}

		loadData();


		return () =>{
			controller.abort();
		}

	}, [playerId]);


    if(state.error !== null){

        return <ErrorMessage title="Win Rates" text={state.error.toString()}/>;
    }


    return <>
        <div className="default-header">Win Rates</div>    
        <Tabs options={[
                {"value": -1, "name": "All"},
                {"value": 0, "name": "Gametypes"},
                {"value": 1, "name": "Maps"},
                {"value": 2, "name": "Custom"},
            ]}
            selectedValue={state.selectedTab}
            changeSelected={(value) =>{ dispatch({"type": "changeTab", "tab": value})}}
        />
        <Loading value={!state.bLoading}/>
        {renderData(state, dispatch)}
    </>
}

export default PlayerWinRates;