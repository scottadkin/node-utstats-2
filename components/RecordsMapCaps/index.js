import { getPlayer, getOrdinal, toPlaytime, convertTimestamp} from "../../api/generic.mjs";
import { useState } from "react";
import Tabs from "../Tabs/";
import InteractiveTable from "../InteractiveTable/index.js";
import Pagination from "../Pagination/index.js";
import Link from "next/link.js";
import CountryFlag from "../CountryFlag/index.js";

const RecordsMapCaps = ({data, page, perPage, selectedTab, changeTab}) =>{

    if(data === null) return null;
    if(data.caps === undefined) return null;

    const headers = {};

    headers.place = "Place";
    headers.date = "Date";
    headers.cap = "Capped By";

    if(selectedTab === "assist"){
        headers.assist = "Assisted By";
    }

    headers.ttime = "Travel Time";
    headers.delta = "Offset";

    let place = (page - 1) * perPage;

    const recordTime = data.mapRecordTime ?? 0;



    const tableData = data.caps.map((cap) =>{

        place++;

        const capPlayer = getPlayer(data.playerNames, cap.cap_player, true);

        let offsetElem = null;
        let offsetClassName = "team-red";

        const offset = cap.travel_time - recordTime;

        if(offset !== 0){

            offsetElem = <>+{toPlaytime(offset,true)}</>

        }else{

            if(place === 1){
                offsetClassName = "purple";
            }else{
                offsetClassName = "team-green";
            }
        }

        

        const currentData = {
            "place": {
                "displayValue": `${place}${getOrdinal(place)}`,
                "className": "place"
            },
            "date": {
                "displayValue": convertTimestamp(cap.match_date, true)
            },
            "cap": {
                "displayValue": <Link href={`/pmatch/${cap.match_id}?player=${capPlayer.id}`}>
                    <CountryFlag country={capPlayer.country}/>{capPlayer.name}
                </Link>
            },
            "ttime": {
                "displayValue": toPlaytime(cap.travel_time, true),
                "className": "playtime"
            },
            "delta": {
                "displayValue": offsetElem,
                "className": `${offsetClassName} playtime`
            }
        };

        if(selectedTab === "assist"){

            const assistElems = [];

            if(cap.assistPlayers !== undefined){

                for(let i = 0; i < cap.assistPlayers.length; i++){

                    const a = cap.assistPlayers[i];
                    
                    const currentPlayer = getPlayer(data.playerNames, a, true);

                    assistElems.push(<Link href={`/pmatch/${cap.match_id}?player=${currentPlayer.id}`} key={`${place}-${currentPlayer.id}`}>
                        <CountryFlag country={currentPlayer.country}/>{currentPlayer.name}{(i < cap.assistPlayers.length - 1) ? ", " :""}
                    </Link>);
                }
            }

            currentData.assist = {
                "displayValue": assistElems,
                "className": "small-font grey"
            };
        }

        return currentData;
    });



 

    return <>
        <Tabs options={[
                {"value": "solo", "name": "Solo Caps"},
                {"value": "assist", "name": "Assisted Caps"},
            ]}
            changeSelected={changeTab}
            selectedValue={selectedTab}
        />
        <InteractiveTable bDisableSorting={true} width={1} headers={headers} data={tableData}/>
    </>
}

export default RecordsMapCaps