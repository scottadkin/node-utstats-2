import {React, useEffect, useState} from "react";
import BarChart from "../BarChart";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import ErrorMessage from "../ErrorMessage";
import Loading from "../Loading";
import MatchWeaponBest from "../MatchWeaponBest";
import Tabs from "../Tabs";
import { ignore0, getPlayer, getTeamColor } from "../../api/generic.mjs";

const getMaxStats = (weaponStats, weaponId, type) =>{

    let best = null;

    for(let i = 0; i < weaponStats.length; i++){

        const w = weaponStats[i];

        if(w.weapon_id !== weaponId) continue;

        if(best === null){
            best = w;
            continue;
        }

        if(best[type] < w[type]) best = w;

    }

    return best;
}

const renderBest = (mode, matchId, weaponStats, players, totalTeams) =>{

    if(mode !== -1) return null;

    const elems = [];

    weaponStats.names.sort((a, b) =>{

        a = a.name.toLowerCase();
        b = b.name.toLowerCase();

        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    });

    for(let i = 0; i < weaponStats.names.length; i++){

        const {id, name} = weaponStats.names[i];

        const bestKills = getMaxStats(weaponStats.playerData, id, "kills");
        const bestKillsPlayer = getPlayer(players, bestKills.player_id, true);

        const bestDamage = getMaxStats(weaponStats.playerData, id, "damage");
        const bestDamagePlayer = getPlayer(players, bestDamage.player_id, true);

        elems.push(<MatchWeaponBest 
            matchId={matchId}
            key={id}
            name={name} 
            bestKills={
                {
                    "data": bestKills,
                    "player": bestKillsPlayer
                }
            }
            bestDamage={
                {
                    "data": bestDamage,
                    "player": bestDamagePlayer 
                }
            }
            totalTeams={totalTeams}
        />);

    }
    return <div>
        {elems}  
    </div>
}

const renderIndividualTabs = (mode, individualDisplayMode, setIndividualDisplayMode) =>{
   
    if(mode !== 0) return null;

    const options = [
        {
            "name": "Tables",
            "value": 0
        },
        {
            "name": "Bar Charts",
            "value": 1
        }
    ];

    return <Tabs options={options} selectedValue={individualDisplayMode} changeSelected={setIndividualDisplayMode}/>
}

const createPlayerTotalStats = (data, players) =>{

    const totals = {};

    let totalDamage = {};
    let totalKills = 0;

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        if(totals[d.player_id] === undefined){

            totals[d.player_id] = {"kills": 0, "damage": 0};
        }

        totals[d.player_id].kills += d.kills;
        totals[d.player_id].damage += d.damage;

        totalKills = d.kills;

        const currentPlayer = getPlayer(players, d.player_id, true);

        if(totalDamage[currentPlayer.team] === undefined) totalDamage[currentPlayer.team] = 0;
        totalDamage[currentPlayer.team] += d.damage;
    }


    const finalData = [];

    for(const [playerId, playerData] of Object.entries(totals)){

        const currentPlayer = getPlayer(players, playerId, true);


        finalData.push({
            "playerId": parseInt(playerId),
            "kills": playerData.kills,
            "damage": playerData.damage,
            "percent": (playerData.damage > 0 && totalDamage[currentPlayer.team] > 0) 
                ? 
                playerData.damage / totalDamage[currentPlayer.team] * 100
                : 
                0
        });
    }

    finalData.sort((a, b) =>{

        a = a.damage;
        b = b.damage;
        if(a < b) return 1;
        if(a > b) return -1;
        return 0;
    });


    return finalData;
}

const renderTotalDamage = (displayMode, matchId, totalData, players, totalTeams) =>{

    if(displayMode !== -2) return null;

    const headers = {
        "name": "Player",
        "kills": "Kills",
        "damage": "Damage",
        
    };

    if(totalTeams >= 2){
        headers.percent ="% Of Team Damage";
    }

    const data = totalData.map((d) =>{

        const {playerId, kills, damage, percent} = d;

        const player = getPlayer(players, playerId, true);

        const current = {
            "name": {
                "value": "", 
                "displayValue": <Link href={`/pmatch/${matchId}?player=${player.id}`}><CountryFlag country={player.country}/>{player.name}</Link>,
                "className": `text-left ${getTeamColor(player.team, totalTeams)}`
            },
            "kills": {"value": kills},
            "damage": {"value": damage}
        };

        current.percent = {"value": percent, "displayValue": <>{percent.toFixed(2)}&#37;</>}

        return current;
    });

    return <>
        <InteractiveTable width={2} headers={headers} data={data}/>
    </>
}

const MatchWeaponSummaryCharts = ({matchId, totalTeams, playerData, host}) =>{

    const [bLoading, setbLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weaponStats, setWeaponStats] = useState({"names": [], "playerData": []});
    const [displayMode, setDisplayMode] = useState(0);
    const [selectedWeaponId, setSelectedWeaponId] = useState(null);
    const [selectedStatType, setSelectedStatType] = useState("kills");
    const [individualDisplayMode, setIndividualDisplayMode] = useState(0);
    const [totalStats, setTotalStats] = useState([]);


    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{
            
            try{
                const req = await fetch("/api/match", {
                    "signal": controller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"matchId": matchId, "mode": "weapons"})
                });

                const res = await req.json();

                

                if(res.error !== undefined){
                    setError(res.error.toString());
                }else{

                    setError(null);

                    if(res.names.length > 0){
                        setSelectedWeaponId(res.names[0].id)
                    }

                    setWeaponStats(res);

                    setTotalStats(createPlayerTotalStats(res.playerData, playerData));
                }


            }catch(err){
                setError(err.toString());
            }

            setbLoading(false);
        }


        loadData();

        return () =>{
            controller.abort();
        }

    }, [matchId, playerData]);

    const renderTabs = () =>{

        return <Tabs options={[
            {"name": "Total Damage", "value": -2},
            {"name": "Best Stats", "value": -1},
            {"name": "Individual Weapons", "value": 0},
           // {"name": "Bar Charts", "value": 1},
        ]} 
            selectedValue={displayMode}
            changeSelected={setDisplayMode}
        />
    }

    const renderWeaponTabs = () =>{

        if(displayMode < 0) return null;
        const tabs = [];

        const names = [...weaponStats.names];

        names.sort((a, b) =>{

            a = a.name.toLowerCase();
            b = b.name.toLowerCase();

            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        });

        for(let i = 0; i < names.length; i++){

            const weapon = names[i];

            const styleClass = `tab ${(selectedWeaponId === weapon.id) ?  "tab-selected": ""}`;

            tabs.push(<div key={weapon.id} className={styleClass} onClick={() => setSelectedWeaponId(weapon.id)}>
                {weapon.name}
            </div>);
        }

        if(tabs.length === 0) return null;

        return <div className="tabs">
            {tabs}
        </div>
    }

    const getWeaponName = (id) =>{

        for(let i = 0; i < weaponStats.names.length; i++){

            const w = weaponStats.names[i]

            if(w.id === id) return w.name;        
        }

        return "Not Found";
    }

    const orderByName = (a, b) =>{

        a = a.name.value;
        b = b.name.value;

        if(a < b) return -1;
        if(a > b) return 1;
        return 0;
    }

    const renderSingleTable = () =>{

        if(displayMode !== 0 || individualDisplayMode !== 0) return null;
        
        const headers = {
            "name": "Player",
            "shots": "Shots",
            "hits": "Hits",
            "accuracy": "Accuracy",
            "kills": "Kills",
            "bestKills": {"title": "Best Spree", "content": "Most kills with a weapon in a single life."},
            "teamKills": "Team Kills",
            "deaths": "Deaths",  
            "suicides": "Suicides",
            "eff": "Efficiency",
            "damage": "Damage"
        };

        const weaponName = getWeaponName(selectedWeaponId);

        const data = [];

        for(let i = 0; i < weaponStats.playerData.length; i++){

            const d = weaponStats.playerData[i];

            if(d.weapon_id !== selectedWeaponId) continue;

            const player = getPlayer(playerData, d.player_id, true);

            data.push({
                "name": {
                    "value": player.name.toLowerCase(), 
                    "className": `text-left ${getTeamColor(player.team, totalTeams)}`,
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${d.player_id}`}>
                        
                        <CountryFlag country={player.country}/>
                        {player.name} 
                        
                    </Link>
                },
                "shots": {"value": d.shots, "displayValue": ignore0(d.shots)},
                "hits": {"value": d.hits, "displayValue": ignore0(d.hits)},
                "accuracy": {"value": d.accuracy, "displayValue": `${d.accuracy.toFixed(2)}%`},
                "deaths": {"value": d.deaths, "displayValue": ignore0(d.deaths)},
                "suicides": {"value": d.suicides, "displayValue": ignore0(d.suicides)},
                "kills": {"value": d.kills, "displayValue": ignore0(d.kills)},
                "bestKills": {"value": d.best_kills, "displayValue": ignore0(d.best_kills)},
                "teamKills": {"value": d.team_kills, "displayValue": ignore0(d.team_kills)},
                "damage": {"value": d.damage, "displayValue": ignore0(d.damage)},
                "eff": {"value": d.efficiency, "displayValue": `${d.efficiency.toFixed(2)}%`}
            });
        }

        data.sort(orderByName);

        return <InteractiveTable key={selectedWeaponId} width="1" title={weaponName} headers={headers} data={data}/>
    }
    

    if(error !== null){
        return <ErrorMessage title="Weapon Statistics" text={error}/>
    }

    if(bLoading){
        return <Loading />;
    }   


    const getPlayerWeaponStat = (playerId) =>{

        for(let i = 0; i < weaponStats.playerData.length; i++){

            const p = weaponStats.playerData[i];

            if(p.player_id === playerId && selectedWeaponId === p.weapon_id){

                let value = p[selectedStatType];

                if(selectedStatType === "accuracy") value = parseFloat(value.toFixed(2));
                return value;
            }
        }

        return 0;
    }

    const renderBarChart = () =>{

        if(displayMode !== 0 || individualDisplayMode !== 1) return null;

        const weaponName = getWeaponName(selectedWeaponId);

        const values = [];
        const names = [];

        for(const [playerId, data] of Object.entries(playerData)){
            names.push(data.name);
            values.push(getPlayerWeaponStat(parseInt(playerId)));
        }


        return <div>
            <div className="tabs">
                <div className={`tab ${(selectedStatType === "kills") ? "tab-selected" : ""}`} 
                    onClick={() => setSelectedStatType("kills")}>Kills</div>
                <div className={`tab ${(selectedStatType === "deaths") ? "tab-selected" : ""}`} 
                    onClick={() => setSelectedStatType("deaths")}>Deaths</div>
                <div className={`tab ${(selectedStatType === "damage") ? "tab-selected" : ""}`} 
                    onClick={() => setSelectedStatType("damage")}>Damage</div>
                <div className={`tab ${(selectedStatType === "shots") ? "tab-selected" : ""}`} 
                    onClick={() => setSelectedStatType("shots")}>Shots</div>
                <div className={`tab ${(selectedStatType === "hits") ? "tab-selected" : ""}`} 
                    onClick={() => setSelectedStatType("hits")}>Hits</div>
                <div className={`tab ${(selectedStatType === "accuracy") ? "tab-selected" : ""}`} 
                    onClick={() => setSelectedStatType("accuracy")}>Accuracy</div>
            </div>
            <BarChart title={weaponName} label={selectedStatType.toUpperCase()} values={values} names={names}/>
        </div>
    }

    return <div>
        <div className="default-header">Weapon Statistics</div>
        {renderTabs()}
        {renderIndividualTabs(displayMode, individualDisplayMode, setIndividualDisplayMode)}
        {renderWeaponTabs()}
        {renderTotalDamage(displayMode, matchId, totalStats, playerData, totalTeams)}
        {renderBest(displayMode, matchId, weaponStats, playerData, totalTeams)}
        {renderBarChart()}
        {renderSingleTable()}
    </div>
}

export default MatchWeaponSummaryCharts;
