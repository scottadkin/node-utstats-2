"use client"
import {BasicTable} from "../Tables";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import { convertTimestamp, getOrdinal, toPlaytime } from "../../../../api/generic.mjs";
import Pagination from "../Pagination";

export function PlayerTotalsTable({type, data, page, perPage, totalResults, selectedGametype, selectedMap}){

    const headers = [
        "Place",
        "Player",
        "Last Match",
        "Matches",
        "Playtime",
        type
    ];

    console.log(data);

    const styles = [
        "place",
        "text-left",
        "playtime",
        null,
        "playtime", 
        (type === "playtime") ? "playtime" : null

    ];


    const pURL = `/records/player-totals/?type=${type}&g=${selectedGametype}&m=${selectedMap}&pp=${perPage}&page=`;

    return <div className="default">
        <BasicTable width={1} headers={headers} columnStyles={styles} rows={
            data.data.map((d, i) =>{

                const place = (page - 1) * perPage  + i + 1;
                const url = `/player/${d.player_id}`;

                let value = d.tvalue;

                if(type === "playtime"){
                    value = toPlaytime(value);
                }

                return [
                    `${place}${getOrdinal(place)}`,
                    <Link href={url}>
                        <CountryFlag country={d.country}/>
                        {d.name}
                    </Link>,
                    <Link href={url}>{convertTimestamp(d.last,true)}</Link>,
                    <Link href={url}>{d.matches}</Link>,
                    <Link href={url}>{toPlaytime(d.playtime)}</Link>,
                    <Link href={url}>{value}</Link>
                ];
            })
        }/>
        <Pagination currentPage={page} perPage={perPage} results={totalResults} url={pURL}/>
    </div>
}