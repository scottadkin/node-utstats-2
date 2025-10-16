"use client"
import Link from "next/link";
import { useState } from "react";
import Tabs from "../Tabs";


export default function PlayerCombogibStats({data}){

    const [mode, setMode] = useState(0);
    const [cat, setCat] = useState(0);

    const modeOptions = [
        {"name": "All Time", "value": 0},
        {"name": "Gametype Totals", "value": 1},
        {"name": "Map Totals", "value": 2},
    ];

    const catOptions = [
        {"name": "Total Kills", "value": 0},
        {"name": "Match Kill Records", "value": 1},
        {"name": "Best Kill Type Sprees", "value": 2},
        {"name": "Best Single Kill Event", "value": 3},
        {"name": "Kills Per Minute", "value": 4},
    ];

    return <>
        <div className="default-header">Combogib Summary</div>
        <Tabs options={modeOptions} selectedValue={mode} changeSelected={(a) => setMode(() => a)}/>
        <Tabs options={catOptions} selectedValue={cat} changeSelected={(a) => setCat(() => a)}/>
    </>
}

/*class PlayerCombogibStats extends React.Component{


    renderPlayerTotalKills(d){

        if(this.state.tab !== 0) return null;

        return <Table2 width={1} header="Total Kills">
            <tr>
                <th>Matches</th>
                <th>Playtime</th>
                <th>Combo Kills</th>
                <th>Insane Combo Kills</th>
                <th>Shock Ball Kills</th>
                <th>Instagib Kills</th>
            </tr>
            <tr>
                <td>{d.total_matches}</td>
                <td>{Functions.toHours(d.playtime)} Hours</td>
                <td>{Functions.ignore0(d.combo_kills)}</td>
                <td>{Functions.ignore0(d.insane_kills)}</td>
                <td>{Functions.ignore0(d.shockball_kills)}</td>
                <td>{Functions.ignore0(d.primary_kills)}</td>
            </tr>
        </Table2>
    }


    renderTotalsKillsPerMinute(d){

        if(this.state.tab !== 3) return null;

        return <Table2 width={1} header="Kills Per Minute">
            <tr>
                <th>Combo Kills</th>
                <th>Insane Combo Kills</th>
                <th>Shock Ball Kills</th>
                <th>Instagib Kills</th>
            </tr>
            <tr>
                <td>{Functions.ignore0(d.combo_kpm)}</td>
                <td>{Functions.ignore0(d.insane_kpm)}</td>
                <td>{Functions.ignore0(d.shockball_kpm)}</td>
                <td>{Functions.ignore0(d.primary_kpm)}</td>
            </tr>
        </Table2>
    }

    renderMatchRecords(d){

        if(this.state.tab !== 1) return null;


        return <Table2 width={1} header="Match Records">
            <tr>
                <th>Combo Kills</th>
                <th>Insane Combo Kills</th>
                <th>Shock Ball Kills</th>
                <th>Instagib Kills</th>
            </tr>
            <tr>
                <td>
                    <Link href={`/pmatch/${d.max_combo_kills_match_id}/?player=${this.props.playerId}`}>
                        
                            {Functions.ignore0(d.max_combo_kills)}
                        
                    </Link>
                </td>
                <td>
                    <Link href={`/pmatch/${d.max_insane_kills_match_id}/?player=${this.props.playerId}`}>
                        
                            {Functions.ignore0(d.max_insane_kills)}
                        
                    </Link>
                </td>
                <td>
                    <Link href={`/pmatch/${d.max_shockball_kills_match_id}/?player=${this.props.playerId}`}>
                        
                            {Functions.ignore0(d.max_shockball_kills)}
                        
                    </Link>
                </td>
                <td>
                    <Link href={`/pmatch/${d.max_primary_kills_match_id}/?player=${this.props.playerId}`}>
                        
                            {Functions.ignore0(d.max_primary_kills)}
                        
                    </Link>
                </td>
            </tr>
        </Table2>
    }

    renderBestSprees(d){

        if(this.state.tab !== 2) return null;

        return <Table2 width={1} header="Best Killing Sprees by Type">
            <tr>
                <th>Combo Kills</th>
                <th>Insane Combo Kills</th>
                <th>Shock Ball Kills</th>
                <th>Instagib Kills</th>
            </tr>
            <tr>
                <td>
                    <Link href={`/pmatch/${d.best_combo_spree_match_id}/?player=${this.props.playerId}`}>
                        
                            {Functions.ignore0(d.best_combo_spree)}
                        
                    </Link>     
                </td>
                <td>
                    <Link href={`/pmatch/${d.best_insane_spree_match_id}/?player=${this.props.playerId}`}>
                        
                            {Functions.ignore0(d.best_insane_spree)}
                        
                    </Link>     
                </td>
                <td>
                    <Link href={`/pmatch/${d.best_shockball_spree_match_id}/?player=${this.props.playerId}`}>
                        
                            {Functions.ignore0(d.best_shockball_spree)}
                        
                    </Link>     
                </td>
                <td>
                    <Link href={`/pmatch/${d.best_primary_spree_match_id}/?player=${this.props.playerId}`}>
                        
                            {Functions.ignore0(d.best_primary_spree)}
                        
                    </Link>     
                </td>
            </tr>
        </Table2>
    }

    renderBestSingleKillEvents(d){

        if(this.state.tab !== 4) return null; 

        const comboElem = <td>
            <Link href={`/pmatch/${d.best_single_combo_match_id}/?player=${this.props.playerId}`}>
                
                    {Functions.ignore0(d.best_single_combo)} <span className="small-font grey">{Functions.plural(d.best_single_combo, "Kill")}</span>
                
            </Link>
        </td>;

        const insaneElem = <td>
            <Link href={`/pmatch/${d.best_single_insane_match_id}/?player=${this.props.playerId}`}>
                
                    {Functions.ignore0(d.best_single_insane)} <span className="small-font grey">{Functions.plural(d.best_single_insane, "Kill")}</span>
                
            </Link>
        </td>;

        const shockElem = <td>
            <Link href={`/pmatch/${d.best_single_shockball_match_id}/?player=${this.props.playerId}`}>
                
                    {Functions.ignore0(d.best_single_shockball)} <span className="small-font grey">{Functions.plural(d.best_single_shockball, "Kill")}</span>
                
            </Link>
        </td>;

        return <Table2 width={1} header="Best Single Events">
            <tr>
                <th>Single Combo</th>
                <th>Single Insane Combo</th>
                <th>Single Shock Ball</th>
            </tr>
            <tr>
                {comboElem}
                {insaneElem}
                {shockElem}       
            </tr>
        </Table2>
    }

    render(){


        if(!this.state.loaded) return <Loading/>;
        if(this.state.error !== null) return <ErrorMessage title="PlayerCombogibStats" text={this.state.error}/>;
        if(this.state.data === null) return null;

        const data = this.state.data;

        return <div>
            <div className="default-header">Combogib Summary</div>

            <div className="tabs">
                <div className={`tab ${(this.state.tab === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeTab(0);
                })}>Total Kills</div>
                <div className={`tab ${(this.state.tab === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeTab(1);
                })}>Match Kill Records</div>
                <div className={`tab ${(this.state.tab === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeTab(2);
                })}>Best Kill Type Sprees</div>
                <div className={`tab ${(this.state.tab === 4) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeTab(4);
                })}>Best Single Kill Event</div>
                <div className={`tab ${(this.state.tab === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeTab(3);
                })}>Kills Per Minute</div>
            </div>

            {this.renderPlayerTotalKills(data)}
            {this.renderMatchRecords(data)}
            {this.renderBestSprees(data)}
            {this.renderTotalsKillsPerMinute(data)}
            {this.renderBestSingleKillEvents(data)}
            {this.renderGametypes(data)}
        </div>
    }
}

export default PlayerCombogibStats;*/