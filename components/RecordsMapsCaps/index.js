import InteractiveTable from "../InteractiveTable";
import Tabs from "../Tabs";
import {getNameFromDropDownList, toPlaytime, convertTimestamp} from "../../api/generic.mjs";
import Link from "next/link";
import CountryFlag from "../CountryFlag";

const RecordsMapsCaps = ({gametypeList, mapList, data, selectedTab, changeTab}) =>{

    if(data == undefined) return null;
    if(data.soloCaps === undefined) return null;

    const headers = {
        "map": "Map",
        "date": "Date",
    };

    if(selectedTab === 1) headers.grab = "Grabbed By";
    if(selectedTab === 1) headers.drop = "Time Dropped";
    if(selectedTab === 1) headers.assist = "Assisted By";
    
    headers.cap = "Capped By";
    headers.capTime = "Travel Time";

    const targetData = (selectedTab === 0) ? data.soloCaps : data.assistCaps;

    const tableData = targetData.map((cap) =>{

        const mapName =  getNameFromDropDownList(mapList, cap.map_id);

        const current = {
            "map": {
                "value": mapName.toLowerCase(), 
                "displayValue": mapName,
                "className": "text-left"
            },
            "date": {
                "value": cap.date,
                "displayValue": convertTimestamp(cap.date, true),
                "className": "playtime"
            },
            "capTime": {
                "value": cap.travel_time, 
                "displayValue": toPlaytime(cap.travel_time, true),
                "className": "playtime"
            }
        };


        
        current.cap = {
            "value": cap.capPlayer.name.toLowerCase(),
            "displayValue": <Link href={`/pmatch/${cap.match_id}/?player=${cap.capPlayer.id}`}>
                <CountryFlag country={cap.capPlayer.country}/>{cap.capPlayer.name}
            </Link>
        };
        

        if(selectedTab === 1){


            current.grab = {
                "value": cap.grabPlayer.name.toLowerCase(),
                "displayValue": <Link href={`/pmatch/${cap.match_id}/?player=${cap.grabPlayer.id}`}>
                    <CountryFlag country={cap.grabPlayer.country}/>{cap.grabPlayer.name}
                </Link>
            };

            current.drop = {
                "value": cap.drop_time,
                "displayValue": toPlaytime(cap.drop_time, true),
                "className": "playtime"
            };

            let assistElems = [];
            //first player is always the grab player, don't display it to save space
            for(let i = 1; i < cap.assistPlayers.length; i++){

                const a = cap.assistPlayers[i];
                assistElems.push(<Link key={`${cap.id}-${i}`} href={`/pmatch/${cap.match_id}/?player=${a.id}`}>
                    <CountryFlag country={a.country}/>
                    {a.name}{(cap.assistPlayers.length > 1 && i < cap.assistPlayers.length - 1) ? ", " : ""}
                </Link>);

            }

            current.assist = {
                "value": cap.assistPlayers.length,
                "displayValue": assistElems,
                "className": "small-font grey"
            };
        }

        return current;
    });




    return <>
        <Tabs options={[
                {"value": 0, "name": "Solo Caps"},
                {"value": 1, "name": "Assisted Caps"},
            ]}
            changeSelected={changeTab}
            selectedValue={selectedTab}
        />
        <InteractiveTable width={1} headers={headers} data={tableData}/>
    </>
}


export default RecordsMapsCaps;