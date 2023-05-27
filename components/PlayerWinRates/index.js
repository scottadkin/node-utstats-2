import { useEffect, useReducer } from "react";
import Loading from "../Loading";
import InteractiveTable from "../InteractiveTable";
import ErrorMessage from "../ErrorMessage";
import Tabs from "../Tabs";
import { ignore0, convertTimestamp } from "../../api/generic.mjs";

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

const renderGametypes = (data) =>{

    const headers = {
        "name": "Name",
        "last": "Last",
        "matches": "Matches Played",
        "lose": "Losses",
        "draws": "Draws",
        "wins": "Wins",
        "winRate": "Win Rate",
        "winStreak": "Best Win Streak",
        "currentStreak": "Current Streak"
         
    };

    const tableData = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(d.map !== 0) continue;

        tableData.push({
            "name": {
                "value": d.gametypeName.toLowerCase(),
                "displayValue": d.gametypeName,
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


const renderData = (state) =>{

    if(state.bLoading) return null;

    if(state.selectedTab === 0){

        console.log(state);

        return renderGametypes(state.data);
    }
    return <>
    </>
}


const PlayerWinRates = ({playerId}) =>{

    const [state, dispatch] = useReducer(reducer, {
		"bLoading": true,
		"data": null,
		"error": null,
        "selectedTab": 0
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

				console.log(res);

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

        return <ErrorMessage title="Win Rates" text="fart"/>;
    }


    return <>
        <div className="default-header">Win Rates</div>    
        <Tabs options={[
                {"value": 0, "name": "Gametypes"},
                {"value": 1, "name": "Maps"},
            ]}
            selectedValue={state.selectedTab}
            changeSelected={(value) =>{ dispatch({"type": "changeTab", "tab": value})}}
        />
        <Loading value={!state.bLoading}/>
        {renderData(state)}
    </>
}

export default PlayerWinRates;