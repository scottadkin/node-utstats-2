import InteractiveTable from "../InteractiveTable";
import { getTeamColor, ignore0 } from "../../../../api/generic.mjs";
import CountryFlag from "../CountryFlag";

function renderTeamTable(playerData, targetTeam, flagKills){

    const headers = {
        "player": "Player",
        "far": {
            "title": "Far", 
            "content": "Player killed an enemy with the flag where the enemy was further away from capping then the distance between the two flag bases."
        },
        "stand": {
            "title": "Home Flag Base", 
            "content": "Player killed an enemy with the flag very close to their home flag base(<5% the distance between flag bases)."
        },
        "home": {
            "title": "Home Base", 
            "content": "Player killed an enemy with the flag in their home base (within >5%-33% of the distance between flag bases)."
        },
        "mid": {
            "title": "Mid", 
            "content": "Player killed an enemy with the flag in the middle of the map (34%-67% of the distance between flag bases)."
        },
        "enemy": {
            "title": "Enemy Base", 
            "content": "Player killed an enemy with the flag where the enemy got back into their home base(33% of distance between both flag bases)."
        },
        "save": {
            "title": "Enemy Flag Stand", 
            "content": "Player killed an enemy with the flag where the enemy was very close to capping(within 5% of the distance between both flag bases)."
        },
    };

    const totals = { 
        "far": 0,
        "stand": 0,
        "home":0,
        "mid": 0,
        "enemy": 0,
        "save": 0
    }

    const rows = [];

    for(let i = 0; i < playerData.length; i++){

        const p = playerData[i];

        if(p.team !== targetTeam) continue;

        const kT = flagKills[p.player_id] ?? null;

        //player had no events
        if(kT === null) continue;

        totals.far += p.ctfData.far;
        totals.stand += p.ctfData.homeFlagStand;
        totals.home += p.ctfData.enemyBase;
        totals.mid += p.ctfData.mid;
        totals.enemy += p.ctfData.homeBase;
        totals.save += p.ctfData.closeSave;

        rows.push({
            "player": {
                "value": p.name.toLowerCase(), 
                "displayValue": <><CountryFlag country={p.country}/>{p.name}</>,
                "className": `text-left ${getTeamColor(p.team, 2)}`
            },
            "far": {"value": kT.far, "displayValue": ignore0(kT.far)},
            "stand": {"value": kT.homeFlagStand, "displayValue": ignore0(kT.homeFlagStand)},
            "home":{"value":  kT.enemyBase, "displayValue": ignore0(kT.enemyBase)},
            "mid": {"value":  kT.mid, "displayValue": ignore0(kT.mid)},
            "enemy": {"value":  kT.homeBase, "displayValue": ignore0(kT.homeBase)},
            "save": {"value":  kT.closeSave, "displayValue": ignore0(kT.closeSave)},
        });
    }

    if(rows.length === 0) return null;

    return <InteractiveTable width={1} headers={headers} data={rows}/>
}

export default function MatchCTFSummaryKills({matchId, mapId, playerData, single, flagKills}){

    if(playerData.length === 1) playerId = playerData[0].player_id;
    

    return <>
        {renderTeamTable(playerData, 0, flagKills)}
        {renderTeamTable(playerData, 1, flagKills)}
        {renderTeamTable(playerData, 2, flagKills)}
        {renderTeamTable(playerData, 3, flagKills)}
    </>

}