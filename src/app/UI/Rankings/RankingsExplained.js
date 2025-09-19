import Tabs from "../Tabs";
import { useState } from "react";
import {BasicTable} from "../Tables/Tables";

export default function RankingsExplained({settings}){

    const [bDisplay, setBDisplay] = useState(false);
    const [category, setCategory] = useState("general");

   
    if(!bDisplay){
        return <button className="search-button" onClick={() =>{
            setBDisplay(!bDisplay);
        }}>Explain rankings</button>
    }

    const tabOptions = [
        {"name": "General", "value": "general"},
        {"name": "Capture The Flag", "value": "ctf"},
        {"name": "Assault", "value": "assault"},
        {"name": "Domination", "value": "dom"},
        {"name": "MonsterHunt", "value": "mh"},
        
    ];

    const rows = [];

    const headers = [
        "Name", "Description", "Value"
    ];

    for(let i = 0; i < settings.length; i++){

        const s = settings[i];


        if((category === "ctf" && !s.name.startsWith("flag_")) || (category === "general" && s.name.startsWith("flag_"))) continue;

        if((category === "dom" && s.name !== "dom_caps") || (category !== "dom" && s.name === "dom_caps")) continue;
        
        if((category === "assault" && s.name !== "assault_objectives") || (category !== "assault" && s.name === "assault_objectives")) continue;

        if(category === "mh" && s.name !== "mh_kills" || (category !== "mh" && s.name === "mh_kills")) continue;



        rows.push([
            s.display_name,
            s.description,
            (s.description.startsWith("Reduce the player's score")) ? `-${ 100 - s.value * 100}%` : s.value
        ]);
    }

    return <>
        <button className="search-button" onClick={() =>{
            setBDisplay(!bDisplay);
        }}>Hide Explain Rankings</button>
        <div className="default-header">Rankings Explained</div>
        <Tabs options={tabOptions} selectedValue={category} changeSelected={setCategory}/>
        <BasicTable width={1} rows={rows} headers={headers} columnStyles={["text-left", "text-left", null]}/>
    </>;
}