import { convertTimestamp, toPlaytime } from "../../../../api/generic.mjs";
import { BasicTable } from "../Tables";

export default function BasicInfo({data}){

    console.log(data);

    const headers = [
        "Address",
        "Password",
        "First Played",
        "Last Played", 
        "Total Matches", 
        "Total Playtime"
    ];

    let ip = (data.display_address !== "") ? data.display_address : data.ip;
    let port = (data.display_port !== 0) ? data.display_port : data.port;

    const rows = [
       [
            `${ip}:${port}`,
            data.password,
            {"className": "date", "value": convertTimestamp(data.first, true)},
            {"className": "date", "value": convertTimestamp(data.last, true)},
            data.matches,
            {"className": "date", "value": toPlaytime(data.playtime)}
        ]
    ];

    return <>
        <BasicTable width={1} headers={headers} rows={rows}/>
    </>
}