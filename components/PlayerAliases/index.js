import CountryFlag from "../CountryFlag/";
import Link from "next/link";
import InteractiveTable from "../InteractiveTable";
import { convertTimestamp, toPlaytime } from "../../api/generic.mjs";


const PlayerAliases = ({host, data, faces, masterName}) =>{

    data = JSON.parse(data);
    faces = JSON.parse(faces);

    const headers = {
        "name": "Name",
        "first": "First Active",
        "last": "Last Active",
        "playtime": "Playtime",
        "spectime": "Spectime",
    };


    const rows = data.map((d) =>{

        return {
            "name": {
                "value": d.name.toLowerCase(),
                "displayValue": <Link key={d.id} href={`/player/${d.id}`}><CountryFlag country={d.country} host={host}/>{d.name}</Link>,
                "className": "text-left"
            },
            "first": {
                "value": d.first,
                "displayValue": convertTimestamp(d.first,true)
            },
            "last": {
                "value": d.last,
                "displayValue": convertTimestamp(d.last,true)
            },
            "playtime": {
                "value": d.playtime,
                "displayValue": toPlaytime(d.playtime)
            },
            "spectime": {
                "value": d.spec_playtime,
                "displayValue": toPlaytime(d.spec_playtime)
            }
        };
    });

    return <>
        <div className="default-header">Possible Aliases</div>
        <InteractiveTable headers={headers} data={rows} width={1}/>
    </>

}


export default PlayerAliases;