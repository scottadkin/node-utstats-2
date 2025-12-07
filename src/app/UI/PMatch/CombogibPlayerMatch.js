"use client"
import { useState } from "react";
import Tabs from "../Tabs";
import {BasicTable} from "../Tables";
import { ignore0, plural } from "../../../../api/generic.mjs";

function renderGeneral(mode, data){

    if(mode !== 0 && mode !== 5) return null;

    const headers = [
        "Combo Kills",
        "Insane Combo Kills",
        "Shockball Kills",
        "Instagib Kills",
    ];

    const row = [
        ignore0(data.combo_kills),
        ignore0(data.insane_kills),
        ignore0(data.shockball_kills),
        ignore0(data.primary_kills)
    ];

    return <BasicTable width={1} headers={headers} rows={[row]} title="Kills By Type"/>;
}

function renderComboStats(mode, data){

    if(mode !== 1 && mode !== 5) return null;

    const headers = ["Kills", "Deaths", "Efficiency", "Best Single Combo", "Most Kills In 1 Life", "Kills Per Minutes"];

    const bestKill = ignore0(data.best_single_combo);

    const row = [
        ignore0(data.combo_kills),
        ignore0(data.combo_deaths),
        `${data.combo_efficiency.toFixed(2)}%`,
        `${bestKill} ${plural(bestKill, "kill")}`,
        ignore0(data.best_combo_spree),
        data.combo_kpm.toFixed(2)
    ];

    return <BasicTable width={1} headers={headers} rows={[row]} title="Combo Stats"/>;
}

function renderInsaneComboStats(mode, data){

    if(mode !== 2 && mode !== 5) return null;

    const headers = ["Kills", "Deaths", "Efficiency", "Best Single Insane Combo", "Most Kills In 1 Life", "Kills Per Minutes"];

    const bestKill = ignore0(data.best_single_insane);

    const row = [
        ignore0(data.insane_kills),
        ignore0(data.insane_deaths),
        `${data.insane_efficiency.toFixed(2)}%`,
        `${bestKill} ${plural(bestKill, "kill")}`,
        ignore0(data.best_insane_spree),
        data.insane_kpm.toFixed(2)
    ];

    return <BasicTable width={1} headers={headers} rows={[row]} title="Insane Combo Stats"/>;
}

function renderShockballStats(mode, data){

    if(mode !== 3 && mode !== 5) return null;

    const headers = ["Kills", "Deaths", "Efficiency", "Best Single Shockball", "Most Kills In 1 Life", "Kills Per Minutes"];

    const bestKill = ignore0(data.best_single_shockball);

    const row = [
        ignore0(data.shockball_kills),
        ignore0(data.shockball_deaths),
        `${data.shockball_efficiency.toFixed(2)}%`,
        `${bestKill} ${plural(bestKill, "kill")}`,
        ignore0(data.best_shockball_spree),
        data.shockball_kpm.toFixed(2)
    ];

    return <BasicTable width={1} headers={headers} rows={[row]} title="Shockball Stats"/>;
}

function renderPrimaryStats(mode, data){

    if(mode !== 4 && mode !== 5) return null;

    const headers = ["Kills", "Deaths", "Efficiency", "Most Kills In 1 Life", "Kills Per Minutes"];

    const row = [
        ignore0(data.primary_kills),
        ignore0(data.primary_deaths),
        `${data.primary_efficiency.toFixed(2)}%`,
        ignore0(data.best_primary_spree),
        data.primary_kpm.toFixed(2)
    ];

    return <BasicTable width={1} headers={headers} rows={[row]} title="Instagib Stats"/>;

}

export default function CombogibPlayerMatch({data}){
    
    const [mode, setMode] = useState(0);
    if(data === null) return null;

    const tabOptions = [
        {"name": "General Stats", "value": 0},
        {"name": "Combo Stats", "value": 1},
        {"name": "Insane Combo Stats", "value": 2},
        {"name": "Shockball Kills", "value": 3},
        {"name": "Instagib Kills", "value": 4},
        {"name": "Display All", "value": 5},
    ];

    return <>
        <div className="default-header">Combogib Stats</div>
        <Tabs options={tabOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        {renderGeneral(mode, data)}
        {renderComboStats(mode, data)}
        {renderInsaneComboStats(mode, data)}
        {renderShockballStats(mode, data)}
        {renderPrimaryStats(mode, data)}
    </>
}