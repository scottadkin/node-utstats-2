import React from "react";
import Loading from "../Loading";
import ErrorMessage from "../../../../components/ErrorMessage";
import Table2 from "../../../../components/Table2";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import { toHours, ignore0, getPlayer, plural} from "../../../../api/generic.mjs";
import { useReducer, useEffect } from "react";
import { BasicTable } from "../Tables";

function reducer(state, action){

    switch(action.type){    
        case "set-error": {
            return {
                ...state,
                "error": action.value
            }
        }
        case "set-loaded": {
            return {
                ...state,
                "loaded": action.value
            }
        }
        case "set-data": {
            return {
                ...state,
                "data": action.data,
                "players": action.players
            }
        }
    }
    return {...state};
}

async function loadData(dispatch, mapId){

    const req = await fetch("/api/combogib", {
        "headers": {"Content-type": "application/json"},
        "method": "POST",
        "body": JSON.stringify({"mode": "maptotal", "mapId": mapId})
    });

    const res = await req.json();

    if(res.error !== undefined){

       dispatch({"type": "set-error", "value": res.error});
    }else{
       dispatch({"type": "set-data", "data": res.data, "players": res.players});
    }


    dispatch({"type": "set-loaded", "value": true});
}

function renderTotals(data){

    const d = data;

    const headers = [
        "Total Matches",
        "Total Playtime",
        "Combo Kills",
        "Insane Combo Kills",
        "Shock Ball Kills",
        "Instagib Kills",
    ];

    return <BasicTable width={1} title="General Summary" headers={headers} rows={[
        d.matches
        `${toHours(d.playtime)} Hours`,
        ignore0(d.combo_kills),
        ignore0(d.insane_kills),
        ignore0(d.shockball_kills),
        ignore0(d.primary_kills),
    ]}/>;

}

function renderRecords(data){

    const d = data;

    const comboKillsPlayer = getPlayer(this.state.players, d.best_combo_spree_player_id, true);
    const insaneKillsPlayer = getPlayer(this.state.players, d.best_insane_spree_player_id, true);
    const ballKillsPlayer = getPlayer(this.state.players, d.best_shockball_spree_player_id, true);
    const primaryKillsPlayer = getPlayer(this.state.players, d.best_primary_spree_player_id, true);

    const headers = [
        "Most Combo Kills",
        "Most Insane Combo Kills",
        "Most ShockBall Kills",
        "Most Instagib Kills",
    ];

    return <BasicTable width={1} headers={headers} title="Kill Type Spree Records" rows={data.map((d) =>{
        return [
            <>
                {ignore0(d.best_combo_kills)}&nbsp;
                <span className="small-font grey">        
                    {plural(d.best_combo_kills, "Kill")} by&nbsp;
                    <Link href={`/pmatch/${d.best_combo_kills_match_id}/?player=${d.best_combo_kills_player_id}`}>    
                        <CountryFlag small={true} country={comboKillsPlayer.country}/>{comboKillsPlayer.name}    
                    </Link> 
                </span>
            </>,
            <>
                {ignore0(d.best_insane_kills)}&nbsp;
                <span className="small-font grey">  
                    {plural(d.best_insane_kills, "Kill")} by&nbsp;
                    <Link href={`/pmatch/${d.best_insane_kills_match_id}/?player=${d.best_insane_kills_player_id}`}>       
                        <CountryFlag small={true} country={insaneKillsPlayer.country}/>{insaneKillsPlayer.name}   
                    </Link>   
                </span>
            </>,
            <>
                {ignore0(d.best_ball_kills)}&nbsp;
                <span className="small-font grey">
                
                    {plural(d.best_ball_kills, "Kill")} by&nbsp;
                    <Link href={`/pmatch/${d.best_ball_kills_match_id}/?player=${d.best_ball_kills_player_id}`}>
                        
                        <CountryFlag small={true} country={ballKillsPlayer.country}/>{ballKillsPlayer.name}
                        
                    </Link>
                    
                </span>
            </>,
            <>
                {ignore0(d.best_primary_kills)}&nbsp;
                <span className="small-font grey">
                    {plural(d.best_primary_kills, "Kill")} by&nbsp;
                    <Link href={`/pmatch/${d.best_primary_kills_match_id}/?player=${d.best_primary_kills_player_id}`}>
                        <CountryFlag small={true} country={primaryKillsPlayer.country}/>{primaryKillsPlayer.name}   
                    </Link>      
                </span>
            </>
        ];

    })}/>;
}

function renderKPM(data){

    const headers = [
        "Combos",
        "Insane Combos",
        "Shockballs",
        "Instagib"
    ];

    return <BasicTable width={1} title="Kills Per Minute" headers={headers} rows={[
        data.combo_kpm.toFixed(2),
        data.insane_kpm.toFixed(2),
        data.shockball_kpm.toFixed(2),
        data.primary_kpm.toFixed(2)
    ]}/>
}

function renderAverage(data){

    let combos = 0;
    let insane = 0;
    let ball = 0;
    let instagib = 0;

    const d = data;

    if(d.combo_kills > 0){
        combos = (d.combo_kills / d.matches).toFixed(2);
    }

    if(d.insane_kills > 0){
        insane = (d.insane_kills / d.matches).toFixed(2);
    }

    if(d.shockball_kills > 0){
        ball = (d.shockball_kills / d.matches).toFixed(2);
    }

    if(d.primary_kills > 0){
        instagib = (d.primary_kills / d.matches).toFixed(2);
    }

    const headers = [
        "Combos Kills Per Match",
        "Insane Combos Kills Per Match",
        "Shock Ball Kills Per Match",
        "Instagib Kills Per Match",
    ];

    return <BasicTable width={1} title="Match Averages" headers={headers} rows={[
        combos, insane, ball, instagib
    ]}/>;

}

export default function CombogibMapTotals({mapId}){

    const [state, dispatch] = useReducer(reducer, {
        "loaded": false, 
        "error": null, 
        "data": null}
    );

    useEffect(() =>{
        loadData(dispatch, mapId);
    },[mapId]);

    if(!state.loaded) return <Loading/>;

    if(state.error !== null){

        if(state.error !== "none"){
            return <ErrorMessage title="CombogibMapTotals" text={state.error}/>;
        }

        return null;
    }

    return <div>
        <div className="default-header">Combogib Map Totals</div>
        {renderTotals(state.data)}
        {renderAverage(state.data)}
        {renderKPM(state.data)}
        {this.renderBestSingle()}
        {this.renderMaxValues()}
        {renderRecords(state.data)}
    </div>
}



class CombogibMapTotals extends React.Component{


    renderBestSingle(){

        const d = this.state.data;

        const comboPlayer = getPlayer(this.state.players, d.best_single_combo_player_id, true);
        const insanePlayer = getPlayer(this.state.players, d.best_single_insane_player_id, true);
        const ballPlayer = getPlayer(this.state.players, d.best_single_shockball_player_id, true);
        
        return <div>
            <Table2 header="Single Event Records" width={1}>
                <tr>
                    <th>Most Kills With One Combo</th>
                    <th>Most Kills With One Insane Combo</th>
                    <th>Most Kills With One Shock Ball</th>
                </tr>
                <tr>
                    <td>
                        {d.best_single_combo}&nbsp;
                        <span className="small-font grey">
                            {plural(d.best_single_combo, "Kill")} by&nbsp;
                            <Link href={`/pmatch/${d.best_single_combo_match_id}?player=${comboPlayer.id}`}>
                                
                                    <CountryFlag small={true} country={comboPlayer.country}/>
                                    {comboPlayer.name}
                                
                            </Link>
                        </span>
                    </td>
                    <td>
                        {d.best_single_insane}&nbsp;
                        <span className="small-font grey">
                            {plural(d.best_single_insane, "Kill")} by&nbsp;
                            <Link href={`/pmatch/${d.best_single_insane_match_id}?player=${insanePlayer.id}`}>
                                
                                    <CountryFlag small={true} country={insanePlayer.country}/>
                                    {insanePlayer.name}
                                
                            </Link>
                        </span>
                    </td>
                    <td>
                        {d.best_single_shockball}&nbsp;
                        <span className="small-font grey">
                            {plural(d.best_single_shockball, "Kill")} by&nbsp;
                            <Link href={`/pmatch/${d.best_single_shockball_match_id}?player=${ballPlayer.id}`}>
                                
                                    <CountryFlag small={true} country={ballPlayer.country}/>
                                    {ballPlayer.name}
                                
                            </Link>
                        </span>
                    </td>
                </tr>
            </Table2>
        </div>
    }

    renderMaxValues(){

        const d = this.state.data;

        const comboPlayer = getPlayer(this.state.players, d.max_combo_kills_player_id, true);
        const insanePlayer = getPlayer(this.state.players, d.max_insane_kills_player_id, true);
        const ballPlayer = getPlayer(this.state.players, d.max_ball_kills_player_id, true);
        const primaryPlayer = getPlayer(this.state.players, d.max_primary_kills_player_id, true);

        return <div>
            <Table2 header="Most Kills in a Match by Type" width={1}>
                <tr>
                    <th>Combo</th>
                    <th>Insane Combo</th>
                    <th>Shock Ball</th>
                    <th>Instagib</th>
                </tr>
                <tr>
                    <td>
                        {d.max_combo_kills}&nbsp;
                        <span className="small-font grey">
                            {plural(d.max_combo_kills, "Kill")} by&nbsp;
                            <Link href={`/pmatch/${d.max_combo_kills_match_id}?player=${d.max_combo_kills_player_id}`}>
                                
                                    <CountryFlag small={true} country={comboPlayer.country}/>
                                    {comboPlayer.name}
                                
                            </Link>
                        </span>
                    </td>
                    <td>
                        {d.max_insane_kills}&nbsp;
                        <span className="small-font grey">
                            {plural(d.max_insane_kills, "Kill")} by&nbsp;
                            <Link href={`/pmatch/${d.max_insane_kills_match_id}?player=${d.max_insane_kills_player_id}`}>
                                
                                    <CountryFlag small={true} country={insanePlayer.country}/>
                                    {insanePlayer.name}
                                
                            </Link>
                        </span>
                    </td>
                    <td>
                        {d.max_ball_kills}&nbsp;
                        <span className="small-font grey">
                            {plural(d.max_ball_kills, "Kill")} by&nbsp;
                            <Link href={`/pmatch/${d.max_ball_kills_match_id}?player=${d.max_ball_kills_player_id}`}>
                                
                                    <CountryFlag small={true} country={ballPlayer.country}/>
                                    {ballPlayer.name}
                                
                            </Link>
                        </span>
                    </td>
                    <td>
                        {d.max_primary_kills}&nbsp;
                        <span className="small-font grey">
                            {plural(d.max_primary_kills, "Kill")} by&nbsp;
                            <Link href={`/pmatch/${d.max_primary_kills_match_id}?player=${d.max_primary_kills_player_id}`}>
                                
                                    <CountryFlag small={true} country={primaryPlayer.country}/>
                                    {primaryPlayer.name}
                                
                            </Link>
                        </span>
                    </td>
                </tr>
            </Table2>
        </div>
    }
}
