"use client"
import {BasicTable} from "../Tables";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import { convertTimestamp, getOrdinal, toPlaytime, removeUnr } from "../../../../api/generic.mjs";
import Pagination from "../Pagination";

const playtimeTypes = [
    "team_0_playtime",
    "team_1_playtime",
    "team_2_playtime",
    "team_3_playtime",
    "spec_playtime",
    "playtime",
    "amp_time",
    "invisibility_time",
    "fastest_kill",
    "slowest_kill",
];

export function PlayerTotalsTable({type, typeTitle, data, page, perPage, totalResults, selectedGametype, selectedMap, bCTF}){

    if(bCTF === undefined) bCTF = false;

    const generalHeaders = [
        "Place",
        "Player",
        "Last Match",
        "Matches",
        "Playtime",
        typeTitle
    ]

    const ctfHeaders = [
        "Place",
        "Player",
        "Matches",
        "Playtime",
        typeTitle
    ];

    const generalStyles = [
        "place",
        "text-left",
        "playtime",
        null,
        "playtime", 
        (playtimeTypes.indexOf(type) !== -1) ? "playtime" : null
    ];

    const ctfStyles = [
        "place",
        "text-left",
        null,
        "playtime", 
        (playtimeTypes.indexOf(type) !== -1) ? "playtime" : null
    ];


    const headers = (bCTF) ? ctfHeaders : generalHeaders;
    const styles = (bCTF) ? ctfStyles : generalStyles;


    const pURL = `/records/${(bCTF) ? "player-ctf-totals" : "player-totals"}/?type=${type}&g=${selectedGametype}&m=${selectedMap}&pp=${perPage}&page=`;

    return <div className="default">
        <BasicTable width={1} headers={headers} columnStyles={styles} rows={
            data.data.map((d, i) =>{

                const place = (page - 1) * perPage  + i + 1;
                const url = `/player/${d.player_id}`;

                let value = d.tvalue;

                if(playtimeTypes.indexOf(type) !== -1){
                    value = toPlaytime(value);
                }

                if(!bCTF){
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
                }else{
                    return [
                        `${place}${getOrdinal(place)}`,
                        <Link href={url}>
                            <CountryFlag country={d.country}/>
                            {d.name}
                        </Link>,
                        <Link href={url}>{d.total_matches}</Link>,
                        <Link href={url}>{toPlaytime(d.playtime)}</Link>,
                        <Link href={url}>{value}</Link>
                    ];
                }
            })
        }/>
        <Pagination currentPage={page} perPage={perPage} results={totalResults} url={pURL}/>
    </div>
}


export function PlayerMatchTable({type, typeTitle, data, page, perPage, totalResults, selectedGametype, selectedMap, bCTF}){

    if(bCTF === undefined) bCTF = false;

    const headers = [
        "Place", "Player", "Date", "Gametype","Map", "Playtime", typeTitle
    ];

    const styles = [
        "place",
        "text-left",
        "playtime",
        "small-font",
        "small-font",
        "playtime", 
        (playtimeTypes.indexOf(type) !== -1) ? "playtime" : null
    ];

    const pURL = `/records/${(bCTF) ? "player-ctf-match" : "player-match"}/?type=${type}&g=${selectedGametype}&m=${selectedMap}&pp=${perPage}&page=`;

    return <div className="default">
        <BasicTable width={1} headers={headers} columnStyles={styles} rows={
            data.data.map((d, i) =>{

                const place = (page - 1) * perPage  + i + 1;
                const url = `/match/${d.match_id}`;

                let value = d.tvalue;

                if(playtimeTypes.indexOf(type) !== -1){
                    value = toPlaytime(value);
                }

                return [
                    `${place}${getOrdinal(place)}`,
                    <Link href={url}>
                        <CountryFlag country={d.country}/>
                        {d.playerName}
                    </Link>,
                    <Link href={url}>{convertTimestamp(d.match_date,true)}</Link>,
                    <Link href={url}>{d.gametypeName}</Link>,
                    <Link href={url}>{removeUnr(d.mapName)}</Link>,
                    <Link href={url}>{toPlaytime(d.playtime)}</Link>,
                    <Link href={url}>{value}</Link>
                ];
            })
        }/>
        <Pagination currentPage={page} perPage={perPage} results={totalResults} url={pURL}/>
    </div>;
}