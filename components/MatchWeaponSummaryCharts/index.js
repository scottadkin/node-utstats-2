import {React, useEffect, useState} from "react";
import BarChart from "../BarChart";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import Functions from "../../api/functions";
import ErrorMessage from "../ErrorMessage";
import Loading from "../Loading";

const MatchWeaponSummaryCharts = ({matchId, totalTeams, playerData, host}) =>{

    const [bLoading, setbLoading] = useState(true);
    const [error, setError] = useState(null);
    const [weaponStats, setWeaponStats] = useState({"names": [], "playerData": []});
    const [displayMode, setDisplayMode] = useState(0);
    const [selectedWeaponId, setSelectedWeaponId] = useState(null);
    const [selectedStatType, setSelectedStatType] = useState("kills");


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

                    if(res.names.length > 0){
                        setSelectedWeaponId(res.names[0].id)
                    }
                    setWeaponStats(res);
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

    }, [matchId]);

    const renderTabs = () =>{

        return <div className="tabs">
            <div className={`tab ${(displayMode === 0) ? "tab-selected" : ""}`} onClick={(() =>
                setDisplayMode(0)
            )}>Table View</div>
            <div className={`tab ${(displayMode === 1) ? "tab-selected" : ""}`}  onClick={(() =>
                setDisplayMode(1)
            )}>Bar Charts</div>
        </div>
    }

    const renderWeaponTabs = () =>{

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

        if(displayMode !== 0) return null;
        
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

            const player = Functions.getPlayer(playerData, d.player_id, true);

            data.push({
                "name": {
                    "value": player.name.toLowerCase(), 
                    "className": `text-left ${Functions.getTeamColor(player.team)}`,
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${d.player_id}`}>
                        
                        <CountryFlag country={player.country}/>
                        {player.name} 
                        
                    </Link>
                },
                "shots": {"value": d.shots, "displayValue": Functions.ignore0(d.shots)},
                "hits": {"value": d.hits, "displayValue": Functions.ignore0(d.hits)},
                "accuracy": {"value": d.accuracy, "displayValue": `${d.accuracy.toFixed(2)}%`},
                "deaths": {"value": d.deaths, "displayValue": Functions.ignore0(d.deaths)},
                "suicides": {"value": d.suicides, "displayValue": Functions.ignore0(d.suicides)},
                "kills": {"value": d.kills, "displayValue": Functions.ignore0(d.kills)},
                "bestKills": {"value": d.best_kills, "displayValue": Functions.ignore0(d.best_kills)},
                "teamKills": {"value": d.team_kills, "displayValue": Functions.ignore0(d.team_kills)},
                "damage": {"value": d.damage, "displayValue": Functions.ignore0(d.damage)},
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

        if(displayMode !== 1) return null;

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
        {renderWeaponTabs()}
        {renderBarChart()}
        {renderSingleTable()}
    </div>
}

export default MatchWeaponSummaryCharts;
