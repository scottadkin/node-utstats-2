import { getPlayer, getOrdinal} from "../../api/generic.mjs";
import { useState } from "react";
import Tabs from "../Tabs/";
import InteractiveTable from "../InteractiveTable/index.js";


const RecordsMapCaps = ({data, page, perPage, selectedTab, changeTab}) =>{

    if(data === null) return null;
    if(data.caps === undefined) return null;

    console.log(data);

    const headers = {
        "place": "Place"
    };

    let place = 0;

    const tableData = data.caps.map((cap) =>{

        place++;
        console.log(cap);

        return {
            "place": {
                "value": place,
                "displayValue": `${place}${getOrdinal(place)}`
            }
        };
    });



 

    return <>
        <Tabs options={[
                {"value": 0, "name": "Solo Caps"},
                {"value": 1, "name": "Assisted Caps"},
            ]}
            changeSelected={changeTab}
            selectedValue={selectedTab}
        />
        <InteractiveTable bDisableSorting={true} width={1} headers={headers} data={tableData}/>
    </>
}

export default RecordsMapCaps