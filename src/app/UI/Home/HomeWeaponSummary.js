"use client"
import { ignore0 } from "../../../../api/generic.mjs";
import InteractiveTable from "../InteractiveTable";
import { useState } from "react";
import Tabs from "../Tabs";

function renderTotals(mode, data){

    if(mode !== "totals") return null;

    const headers = {
        "title": "Weapon",
        "matches": "Matches Used",
        "shots": "Shots",
        "hits": "Hits",
        "accuracy": "Accuracy",
        "damage": "Damage",
        "deaths": "Deaths",
        "suicides": "Suicides",
        "teamKills": "Team Kills",
        "kills": "Kills"
    };

    const rows = data.map((d) =>{

        return {
            "title": {"value": d.name.toLowerCase(), "displayValue": d.name, "className": "text-left"},
            "matches": {"value": d.matches},
            "shots": {"value": d.shots, "displayValue": ignore0(d.shots)},
            "hits": {"value": d.hits, "displayValue": ignore0(d.hits)},
            "accuracy": {"value": d.accuracy, "displayValue": <>{d.accuracy.toFixed(2)}%</>},
            "damage": {"value": d.damage},
            "deaths": {"value": d.deaths, "displayValue": ignore0(d.deaths)},
            "suicides": {"value": d.suicides, "displayValue": ignore0(d.suicides)},
            "teamKills": {"value": d.team_kills, "displayValue": ignore0(d.team_kills)},
            "kills": {"value": d.kills, "displayValue": ignore0(d.kills)}
        }
    });

    return <InteractiveTable title="Weapon Totals" width={1} headers={headers} data={rows}/>
}

function renderRecords(mode, data){

    if(mode !== "records") return null;

    const headers = {
        "title": "Weapon",
        "shots": "Shots",
        "hits": "Hits",
        "damage": "Damage",
        "deaths": "Deaths",
        "suicides": "Suicides",
        "teamKills": "Team Kills",
        "kills": "Kills",
        "spree": "Best Spree",
        "teamSpree": "Team Kills(Single Life)",
    };

    const rows = data.map((d) =>{

        return {
            "title": {"value": d.name.toLowerCase(), "displayValue": d.name, "className": "text-left"},
            "shots": {"value": d.max_shots, "displayValue": ignore0(d.max_shots)},
            "hits": {"value": d.max_hits, "displayValue": ignore0(d.max_hits)},
            "damage": {"value": d.max_damage},
            "deaths": {"value": d.max_deaths, "displayValue": ignore0(d.max_deaths)},
            "suicides": {"value": d.max_suicides, "displayValue": ignore0(d.max_suicides)},
            "teamKills": {"value": d.max_team_kills, "displayValue": ignore0(d.max_team_kills)},
            "kills": {"value": d.max_kills, "displayValue": ignore0(d.max_kills)},
            "spree": {"value": d.best_kills_spree, "displayValue": ignore0(d.best_kills_spree)},
            "teamSpree": {"value": d.best_team_kills_spree, "displayValue": ignore0(d.best_team_kills_spree)}
        }
    });

    return <InteractiveTable title="Match Records" width={1} headers={headers} data={rows}/>
}

export default function HomeWeaponSummary({data}){

    const [mode, setMode] = useState("totals");


    const tabOptions = [
        {"name": "Totals", "value": "totals"},
        {"name": "Match Records", "value": "records"},
    ];
    return <div className="default m-bottom-10">
        <div className="default-header">Weapons Summary</div>
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(v) =>{ setMode(() => v)} }/>
        {renderTotals(mode, data)}
        {renderRecords(mode, data)}
    </div>
}