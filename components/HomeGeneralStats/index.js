import CalendarThing from "../CalendarThing";
import HomeActivityGraph from "../HomeActivityGraph";
import Tabs from "../Tabs";
import { useReducer } from "react";

const reducer = (state, action) =>{

    switch(action.type){

        case "changeTab": {
            return {
                ...state,
                "selectedTab": action.tab
            }
        }
    }

    return state;
}

const HomeGeneralStats = () =>{

    const [state, dispatch] = useReducer(reducer, {
        "selectedTab": 0
    });

    /*
            <Tabs 
            options={[
                {"name": "Graph", "value": 0},
                {"name": "Heat Map", "value": 1}
            ]}
            selectedValue={state.selectedTab}
            changeSelected={(id) => dispatch({"type": "changeTab", "tab": id})}
        />
        <HomeActivityGraph />
    */

    return <>
        <div className="default-header">Recent Matches &amp; Player Stats</div>

        <CalendarThing />
    </>
}

export default HomeGeneralStats;