"use client"
import { BasicTable } from "../Tables";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import { convertTimestamp, toPlaytime } from "../../../../api/generic.mjs";
import { useRouter } from "next/navigation";


function changeURL(router, sortBy, currentSortBy, order, name, country, active){

    if(sortBy === currentSortBy){

        order = (order === "asc") ? "desc" : "asc";

    }else{
        order = "asc";
    }

    router.push(`/players/?sb=${sortBy}&o=${order}&name=${name}&country=${country}&active=${active}`);
}

export default function PlayersTableView({data, order, sortBy, name, country, active}){


    const router = useRouter();


    const tableHeaders = [
        {
            "name": "Name",
            "callback": () => { 
                changeURL(router, "name", sortBy, order, name, country, active);
            },
        },
        {
            "name": "Last Active",
            "callback": () => { 
                changeURL(router, "last", sortBy, order, name, country, active);
            },
        },
        {
            "name": "Playtime",
            "callback": () => { 
                changeURL(router, "playtime", sortBy, order, name, country, active);
            },
        },
        {
        "name": "Matches",
            "callback": () => { 
                changeURL(router, "matches", sortBy, order, name, country, active);
            },
        },
        {
            "name": "Kills",
            "callback": () => { 
                changeURL(router, "kills", sortBy, order, name, country, active);
            },
        },
        {
            "name": "Score",
            "callback": () => { 
                changeURL(router, "score", sortBy, order, name, country, active); 
            },
        },
    ];

    const tableStyles = [
        "text-left", "playtime", "playtime", null, null, null
    ];


    return <BasicTable headers={tableHeaders} columnStyles={tableStyles} rows={[...data.map((s) =>{

        const url = `/player/${s.id}`;

        return [
            <Link href={url}><CountryFlag country={s.country}/>{s.name}</Link>,
            <Link href={url}>{convertTimestamp(s.last, true)}</Link>,
            <Link href={url}>{toPlaytime(s.playtime)}</Link>,
            <Link href={url}>{s.matches}</Link>,
            <Link href={url}>{s.kills}</Link>,
            <Link href={url}>{s.score}</Link>
        ];
    })]}/>

}