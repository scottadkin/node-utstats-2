"use client"
import CountryFlag from '../CountryFlag/';
import {useState} from 'react';
import Link from 'next/link';
import InteractiveTable from '../InteractiveTable';
import { getTeamColor, ignore0 } from '../../../../api/generic.mjs';
import Tabs from '../Tabs';

function getSpreeHeaders(killMode){

    if(killMode === 0){

        return {
            "player": "Player",
            "spree": {"title": "Killing Spree", "content": "Player killed 5 to 9 players in a single life."},
            "rampage": {"title": "Rampage", "content": "Player killed 10 to 14 players in a single life."},
            "dominating": {"title": "Dominating", "content": "Player killed 15 to 19 players in a single life."},
            "unstoppable": {"title": "Unstoppable", "content": "Player killed 20 to 24 players in a single life."},
            "godlike": {"title": "Godlike", "content": "Player killed at least 25 players in a single life."},
            "best": {"title": "Best Spree", "content": "Most Kills the player got in a single life."},
        };
    }

    if(killMode === 1){

        return {
            "player": "Player",
            "spree": {"title": "Killing Spree", "content": "Player killed 5 to 9 players in a single life."},
            "rampage": {"title": "Rampage", "content": "Player killed 10 to 14 players in a single life."},
            "dominating": {"title": "Dominating", "content": "Player killed 15 to 19 players in a single life."},
            "unstoppable": {"title": "Unstoppable", "content": "Player killed 20 to 24 players in a single life."},
            "godlike": {"title": "Godlike", "content": "Player killed 25 to 29 players in a single life."},
            "easy": {"title": "Too Easy", "content": "Player killed 30 to 34 players in a single life."},
            "brutalizing": {"title": "Brutalizing", "content": "Player killed at least 35 players in a single life."},
            "best": {"title": "Best Spree", "content": "Most Kills the player got in a single life."},
        };
        
    }

    if(killMode === 2){

        return {
            "player": "Player",
            "spree": {"title": "Killing Spree", "content": "Player killed 5 to 9 players in a single life."},
            "rampage": {"title": "Rampage", "content": "Player killed 10 to 14 players in a single life."},
            "dominating": {"title": "Dominating", "content": "Player killed 15 to 19 players in a single life."},
            "unstoppable": {"title": "Unstoppable", "content": "Player killed 20 to 24 players in a single life."},
            "godlike": {"title": "Godlike", "content": "Player killed 25 to 29 players in a single life."},
            "sick": {"title": "Wicked Sick", "content": "Player killed at least 30 players in a single life."},
            "best": {"title": "Best Spree", "content": "Most Kills the player got in a single life."},
        };
        
        
    }

    if(killMode === 3){
        
        return {
            "player": "Player",
            "spree": {"title": "Killing Spree", "content": "Player killed 5 to 9 players in a single life."},
            "rampage": {"title": "Rampage", "content": "Player killed 10 to 14 players in a single life."},
            "dominating": {"title": "Dominating", "content": "Player killed 15 to 19 players in a single life."},
            "unstoppable": {"title": "Unstoppable", "content": "Player killed 20 to 24 players in a single life."},
            "godlike": {"title": "Godlike", "content": "Player killed 25 to 29 players in a single life."},
            "massacre": {"title": "Massacre", "content": "Player killed at least 30 players in a single life."},
            "best": {"title": "Best Spree", "content": "Most Kills the player got in a single life."},
        };
    }
}

function getMultiHeaders(killMode){

    if(killMode === 0){

        return {
            "player": "Player",
            "double": {"title": "Double Kill",  "content": "Player Killed 2 Players in a short amount of time without dying."},
            "multi": {"title": "Multi Kill",  "content": "Player Killed 3 Players in a short amount of time without dying."},
            "ultra": {"title": "Ultra Kill",  "content": "Player Killed 4 Players in a short amount of time without dying."},
            "monster": {"title": "Monster Kill", "content": "Player Killed 5 or more Players in a short amount of time without dying."},
            "best": {"title": "Best Multi Kill", "content": "Most players killed in a short amount of time without dying."},
        };
    }

    if(killMode === 1){

        return {
            "player": "Player",
            "double": {"title": "Double Kill",  "content": "Player Killed 2 Players in a short amount of time without dying."},
            "triple": {"title": "Triple Kill",  "content": "Player Killed 3 Players in a short amount of time without dying."},
            "multi": {"title": "Multi Kill",  "content": "Player Killed 4 Players in a short amount of time without dying."},
            "mega": {"title": "Mega Kill",  "content": "Player Killed 5 Players in a short amount of time without dying."},
            "ultra": {"title": "Ultra Kill",  "content": "Player Killed 6 Players in a short amount of time without dying."},
            "monster": {"title": "Monster Kill", "content": "Player Killed 7 or more Players in a short amount of time without dying."},
            "best": {"title": "Best Multi Kill", "content": "Most players killed in a short amount of time without dying."},
        };
    }

    if(killMode === 2){

        return {
            "player": "Player",
            "double": {"title": "Double Kill",  "content": "Player Killed 2 Players in a short amount of time without dying."},
            "multi": {"title": "Multi Kill",  "content": "Player Killed 3 Players in a short amount of time without dying."},
            "mega": {"title": "Mega Kill",  "content": "Player Killed 4 Players in a short amount of time without dying."},
            "ultra": {"title": "Ultra Kill",  "content": "Player Killed 5 Players in a short amount of time without dying."},
            "monster": {"title": "Monster Kill",  "content": "Player Killed 6 Players in a short amount of time without dying."},
            "ludicrous": {"title": "Ludicrous Kill",  "content": "Player Killed 7 Players in a short amount of time without dying."},
            "shit": {"title": "Holy Shit", "content": "Player Killed 8 or more Players in a short amount of time without dying."},
            "best": {"title": "Best Multi Kill", "content": "Most players killed in a short amount of time without dying."},
        };
    }

    if(killMode === 3){

        return {
            "player": "Player",
            "double": {"title": "Double Kill",  "content": "Player Killed 2 Players in a short amount of time without dying."},
            "multi": {"title": "Multi Kill",  "content": "Player Killed 3 Players in a short amount of time without dying."},
            "mega": {"title": "Mega Kill",  "content": "Player Killed 4 Players in a short amount of time without dying."},
            "ultra": {"title": "Ultra Kill",  "content": "Player Killed 5 Players in a short amount of time without dying."},
            "monster": {"title": "Monster Kill", "content": "Player Killed 6 or more Players in a short amount of time without dying."},
            "best": {"title": "Best Multi Kill", "content": "Most players killed in a short amount of time without dying."},
        };
    }
}

function bPlayerAnyMultis(player){

    for(let i = 1; i <= 7; i++){

        if(player[`multi_${i}`] > 0) return true;
    }

    return false;
}

function bPlayerAnySprees(player){

    for(let i = 1; i <= 7; i++){

        if(player[`spree_${i}`] > 0) return true;
    }

    return false;
}

function getMultiData(killMode, players, bTeamGame, bSingle, matchId, targetPlayerId){

    const data = [];

    for(let i = 0; i < players.length; i++){

        const p = players[i];

        if(bSingle){
            if(p.player_id !== targetPlayerId) continue;
        }

        if(!bPlayerAnyMultis(p)) continue;

        const teamColor = (bTeamGame) ? getTeamColor(p.team) : "";

        const current = {
            "player": {
                "value": p.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${p.player_id}`}>
                    
                    <CountryFlag country={p.country}/>{p.name}
                    
                </Link>,
                "className": `player ${teamColor}`
            },
            "double": {"value": p.multi_1, "displayValue": ignore0(p.multi_1)}
        };

        if(killMode === 0){

            const monsterKills = p.multi_4 + p.multi_5 + p.multi_6 + p.multi_7;
            current["multi"] = {"value": p.multi_2, "displayValue": ignore0(p.multi_2)};
            current["ultra"] = {"value": p.multi_3, "displayValue": ignore0(p.multi_3)};
            current["monster"] = {"value": monsterKills, "displayValue": ignore0(monsterKills)};
            
        }

        if(killMode === 1){

            const monsterKills = p.multi_6 + p.multi_7;

            current["triple"] = {"value": p.multi_2, "displayValue": ignore0(p.multi_2)};
            current["multi"] = {"value": p.multi_3, "displayValue": ignore0(p.multi_3)};
            current["mega"] = {"value": p.multi_4, "displayValue": ignore0(p.multi_4)};
            current["ultra"] = {"value": p.multi_5, "displayValue": ignore0(p.multi_5)};
            current["monster"] = {"value": monsterKills, "displayValue": ignore0(monsterKills)};
        }

        if(killMode === 2){

            current["multi"] = {"value": p.multi_2, "displayValue": ignore0(p.multi_2)};
            current["mega"] = {"value": p.multi_3, "displayValue": ignore0(p.multi_3)};
            current["ultra"] = {"value": p.multi_4, "displayValue": ignore0(p.multi_4)};
            current["monster"] = {"value": p.multi_5, "displayValue": ignore0(p.multi_5)};
            current["ludicrous"] = {"value": p.multi_6, "displayValue": ignore0(p.multi_6)};
            current["shit"] = {"value": p.multi_7, "displayValue": ignore0(p.multi_7)};
            
        }



        if(killMode === 3){

            const monsterKills = p.multi_5 + p.multi_6 + p.multi_7;

            current["multi"] = {"value": p.multi_2, "displayValue": ignore0(p.multi_2)};
            current["mega"] = {"value": p.multi_3, "displayValue": ignore0(p.multi_3)};
            current["ultra"] = {"value": p.multi_4, "displayValue": ignore0(p.multi_4)};
            current["monster"] = {"value": monsterKills, "displayValue": ignore0(monsterKills)};
            
        }

        current["best"] = {"value": p.multi_best, "displayValue": ignore0(p.multi_best)};

        data.push(current);

    }

    return data;
}

function getSpreeData(killMode, players, bTeamGame, bSingle, matchId, targetPlayerId){

    const data = [];

    for(let i = 0; i < players.length; i++){

        if(!bPlayerAnySprees(players[i])) continue;

        const p = players[i];

        if(bSingle){
            if(p.player_id !== targetPlayerId) continue;
        }

        const teamColor = (bTeamGame) ? getTeamColor(p.team) : "";

        const current = {
            "player": {
                "value": p.name.toLowerCase(), 
                "displayValue": <Link href={`/pmatch/${matchId}/?player=${p.player_id}`}>
                    <CountryFlag country={p.country}/>{p.name}            
                </Link>,
                "className": `player ${teamColor}`
            },
            "spree": {"value": p.spree_1, "displayValue": ignore0(p.spree_1)},
            "rampage": {"value": p.spree_2, "displayValue": ignore0(p.spree_2)},
            "dominating": {"value": p.spree_3, "displayValue": ignore0(p.spree_3)},
            "unstoppable": {"value": p.spree_4, "displayValue": ignore0(p.spree_4)},
        };

        if(killMode === 0){

            const godlikes = p.spree_5 + p.spree_6 + p.spree_7;
            current["godlike"] = {"value": godlikes, "displayValue": ignore0(godlikes)};
        }

        if(killMode === 1){

            current["godlike"] = {"value": p.spree_5, "displayValue": ignore0(p.spree_5)};
            current["easy"] = {"value": p.spree_6, "displayValue": ignore0(p.spree_6)};
            current["brutalizing"] = {"value": p.spree_7, "displayValue": ignore0(p.spree_7)};
        }

        if(killMode === 2){

            current["godlike"] = {"value": p.spree_5, "displayValue": ignore0(p.spree_5)};
            current["sick"] = {"value": p.spree_6 + p.spree_7, "displayValue": ignore0(p.spree_6 + p.spree_7)};
        }

        if(killMode === 3){

            current["godlike"] = {"value": p.spree_5, "displayValue": ignore0(p.spree_5)};
            current["massacre"] = {"value": p.spree_6 + p.spree_7, "displayValue": ignore0(p.spree_6 + p.spree_7)};
        }

        current["best"] = {"value": p.spree_best, "displayValue": ignore0(p.spree_best)}

        data.push(current);
    }

    return data;
}

function bAnyMultiKills(players, bSingle, targetPlayerId){

    for(let i = 0; i < players.length; i++){

        const p = players[i];

        if(!bSingle){
            if(bPlayerAnyMultis(p)) return true;
        }else{

            if(p.player_id === targetPlayerId){
                return bPlayerAnyMultis(p);
            }
        }
    }

    return false;
}

function bAnySprees(players, targetPlayerId){

    for(let i = 0; i < players.length; i++){

        if(targetPlayerId === -1){
            return bPlayerAnySprees(players[i]);
        }

        if(targetPlayerId !== -1 && players[i].player_id === targetPlayerId){   
            return bPlayerAnySprees(players[i]);
        }
    }

    return false;
}

function renderMultiKills(killMode, players, bTeamGame, bSingle, targetPlayerId, matchId){

    if(!bAnyMultiKills(players, bSingle, targetPlayerId)) return null;

    const headers = getMultiHeaders(killMode);

    const data = getMultiData(killMode, players, bTeamGame, bSingle, matchId, targetPlayerId);

    return <InteractiveTable width={1} headers={headers} data={data} />
}

function renderSprees(killMode, players, bTeamGame, bSingle, targetPlayerId, matchId){

    if(!bAnySprees(players, targetPlayerId)) return null;

    const headers = getSpreeHeaders(killMode);
    const data = getSpreeData(killMode, players, bTeamGame, bSingle, matchId, targetPlayerId);

    return <InteractiveTable width={1} headers={headers} data={data} />;
}

export default function MatchSpecialEvents({matchId, bTeamGame, players, bSingle, targetPlayerId}){

    const [killMode, setKillMode] = useState(0);

    //if(!bAnySprees(players, targetPlayerId) /*&& !bAnyMultiKills(players, bSingle, targetPlayerId)*/) return null;

    const tabOptions = [
        {"name": "Classic", "value": 0},
        {"name": "SmartCTF/DM", "value": 1},
        {"name": "UT2K4", "value":2},
        {"name": "UT3", "value": 3},
    ];

    return <div>
        <div className="default-header">Special Events</div>
        <Tabs options={tabOptions} selectedValue={killMode} changeSelected={(a) => setKillMode(() => a)}/>
        {renderMultiKills(killMode, players, bTeamGame, bSingle, targetPlayerId, matchId)}
        {renderSprees(killMode, players, bTeamGame, bSingle, targetPlayerId, matchId)}
    </div>
}