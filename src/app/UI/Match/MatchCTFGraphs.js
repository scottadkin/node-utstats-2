"use client"
import CustomGraph from "../CustomGraph";
import { scalePlaytime, MMSS, toPlaytime } from "../../../../api/generic.mjs";

export default function MatchCTFGraphs({matchId, graphData, totalTeams, players, matchStart, matchEnd, bHardcore}){

    matchStart = scalePlaytime(parseFloat(matchStart), bHardcore);
    const d = {...graphData};
    const l = {...graphData.labels};

    const data = [
        d.caps,
        d.assists,
        d.grabs,
        d.pickups,
        d.covers,
        d.seals,
        d.kills,
        d.returns,
        d.saves,
        d.drops,
        d.teamCaps,
        d.teamAssists,
        d.teamGrabs,
        d.teamPickups,
        d.teamCovers,
        d.teamSeals,
        d.teamKills,
        d.teamReturns,
        d.teamSaves,
        d.teamDrops,
    ];

    const keys = [
        "caps", "assists","grabs","pickups","covers","seals","kills","returns","saves","drops"
    ];

    for(let i = 0; i < keys.length; i++){

        //const fart = l[keys[i]];

        const key = keys[i];

        const currentLabels = [];

        for(let x = 0; x < l[key].length; x++){

            const timestamp = scalePlaytime(parseFloat(l[key][x]),bHardcore)//, bHardcore;
            //timestamp -= matchStart;
            //console.log(timestamp, matchStart);
            currentLabels.push(MMSS(timestamp - matchStart));
        }

        

        currentLabels.unshift(MMSS(0));
        l[key] = currentLabels;

    }

    const graphLabels = [
        l.caps,
        l.assists,
        l.grabs,
        l.pickups,
        l.covers,
        l.seals,
        l.kills,
        l.returns,
        l.saves,
        l.drops,
        l.caps,
        l.assists,
        l.grabs,
        l.pickups,
        l.covers,
        l.seals,
        l.kills,
        l.returns,
        l.saves,
        l.drops,
    ];

    const tabs = [
        {"name": "Caps", "title": "Flag Captures"},
        {"name": "Assists", "title": "Flag Assists"},
        {"name": "Grabs", "title": "Flag Grabs"},
        {"name": "Pickups", "title": "Flag Pickups"},
        {"name": "Covers", "title": "Flag Covers"},
        {"name": "Seals", "title": "Flag Seals"},
        {"name": "Kills", "title": "Flag Kills"},
        {"name": "Returns", "title": "Flag Returns"},
        {"name": "Close Saves", "title": "Flag Close Saves"},
        {"name": "Drops", "title": "Flag Drops"},
        {"name": "Team Caps", "title": "Flag Team Total Caps"},
        {"name": "Team Assists", "title": "Flag Team Total Assists"},
        {"name": "Team Grabs", "title": "Flag Team Total Grabs"},
        {"name": "Team Pickups", "title": "Flag Team Total Pickups"},
        {"name": "Team Covers", "title": "Flag Team Total Covers"},
        {"name": "Team Seals", "title": "Flag Team Total Seals"},
        {"name": "Team Kills", "title": "Flag Team Total Flag Kills"},
        {"name": "Team Returns", "title": "Flag Team Total Returns"},
        {"name": "Team Close Saves", "title": "Flag Team Total Close Saves"},
        {"name": "Team Drops", "title": "Flag Team Total Drops"}
    ];

    const labelsPrefix = [
        "Flag Caps ",
        "Flag Assists ",
        "Flag Grabs ",
        "Flag Pickups ",
        "Flag Covers ",
        "Flag Seals ",
        "Flag Kills ",
        "Flag Returns ",
        "Flag Close Saves ",
        "Flag Drops ",
        "Flag Caps ",
        "Flag Assists ",
        "Flag Grabs ",
        "Flag Pickups ",
        "Flag Covers ",
        "Flag Seals ",
        "Flag Kills ",
        "Flag Returns ",
        "Flag Close Saves ",
        "Flag Drops "
    ];

    return <>
        <div className="default-header">Capture The Flag Graphs</div>
        <CustomGraph tabs={tabs} labels={graphLabels} labelsPrefix={labelsPrefix} data={data}/>
    </>
}
