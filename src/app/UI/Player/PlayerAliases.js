import CountryFlag from "../CountryFlag";
import Link from "next/link";
import InteractiveTable from "../InteractiveTable";
import { convertTimestamp, toPlaytime } from "../../../../api/generic.mjs";


export default function PlayerAliases({data}){

    if(data.length === 0) return null;

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
                "value": d.player.name.toLowerCase(),
                "displayValue": <Link key={d.player_id} href={`/player/${d.player_id}`}><CountryFlag country={d.player.country}/>{d.player.name}</Link>,
                "className": "text-left"
            },
            "first": {
                "value": d.first_match,
                "displayValue": convertTimestamp(d.first_match,true),
                "className": "date"
            },
            "last": {
                "value": d.last_match,
                "displayValue": convertTimestamp(d.last_match,true),
                "className": "date"
            },
            "playtime": {
                "value": d.playtime,
                "displayValue": toPlaytime(d.playtime),
                "className": "playtime"
            },
            "spectime": {
                "value": d.spec_playtime,
                "displayValue": toPlaytime(d.spec_playtime),
                "className": "playtime"
            }
        };
    });

    return <>
        <div className="default-header">Possible Aliases</div>
        <InteractiveTable headers={headers} data={rows} width={1}/>
    </>
}