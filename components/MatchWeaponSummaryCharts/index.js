import React from "react";
import BarChart from "../BarChart";
import InteractiveTable from "../InteractiveTable";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import Functions from "../../api/functions";

class MatchWeaponSummaryCharts extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "mode": 0,
            "tableViewMode": 1,
            /*"selectedTable": 0,*/
            "selected": null, 
            "selectedName": null, 
            "statType": "kills", 
            "statTypeTitle": "Kills"
        };     
    }

    changeMode(id){
        this.setState({"mode": id});
    }

    changeTableView(id){
        this.setState({"tableViewMode": id});
    }

    changeSelected(id, name){

        this.setState({"selected": id, "selectedName": name});

        if(!this.bAnyDataType(id, this.state.statType)){
            this.findAvailableDataType(id);
        }
    }

    findAvailableDataType(weaponId){

        for(let i = 0; i < this.props.types.length; i++){

            const {name, display} = this.props.types[i];

            if(this.bAnyDataType(weaponId, name)){
                this.changeStatType(name, display);
                return;
            }
        }
    }

    changeStatType(type, title){

        this.setState({"statType": type, "statTypeTitle": title});
    }

    componentDidMount(){

        this.setInitialSelected();
    }

    setInitialSelected(){

        if(this.props.weaponNames.length > 0){
            this.changeSelected(this.props.weaponNames[0].id, this.props.weaponNames[0].name);
           // this.setState({"selected": this.props.weaponNames[0].id});
        }
    }

    bAnyDataType(weaponId, statType){

        for(let i = 0; i < this.props.playerData.length; i++){

            const p = this.props.playerData[i];

            if(p.weapon_id === weaponId){
                
                if(p[statType] !== 0) return true;        
            }
        }

        return false;
    }

    bAnyData(weaponId){
        
        const types = this.props.types;

        for(let i = 0; i < this.props.playerData.length; i++){

            const p = this.props.playerData[i];

            if(p.weapon_id === weaponId){

                for(let x = 0; x < types.length; x++){
    
                    if(p[types[x].name] !== 0) return true;
                }
            }
        }

        return false;
    }

    createBlankData(){

        const data = [];

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            if(p.playtime === 0 || p.spectator) continue;

            data.push({"id": p.id, "name": p.name, "value": 0});
        }

        return data;
    }

    getPlayerIndex(players, id){

        for(let i = 0; i < players.length; i++){

            const p = players[i];
            if(p.id === id) return i;
        }

        return null;
    }

    getWeaponData(){

        const weaponId = this.state.selected;
        const statType = this.state.statType

        const data = this.createBlankData();

        for(let i = 0; i < this.props.playerData.length; i++){

            const p = this.props.playerData[i];

            if(p.weapon_id === weaponId){

                const playerIndex = this.getPlayerIndex(data, p.player_id);

                if(playerIndex !== null){
                    data[playerIndex].value = p[statType];
                }else{
                    console.trace("playerIndex is null");
                }       
            }
        }


        const values = [];
        const names = [];

        
        for(let i = 0; i < data.length; i++){

            const {name, value} = data[i];
            values.push(value);
            names.push(name);
        }

        return {"values": values, "names": names};
    }


    getWeaponName(id){

        for(let i = 0; i < this.props.weaponNames.length; i++){

            const w = this.props.weaponNames[i];

            if(w.id === id) return w.name;
        }

        return "Not Found";
    }


    createWeaponNameTabs(){

        if(this.state.mode === 0){

            if(this.state.tableViewMode === 0) return null;
        }

        const tabs = [];

        for(let i = 0; i < this.props.weaponNames.length; i++){
  
            const w = this.props.weaponNames[i];

            if(!this.bAnyData(w.id)) continue;

            const className = `tab ${(this.state.selected === w.id) ? "tab-selected": ""}`;

            tabs.push(<div key={w.id} className={className} onClick={(() =>{
                this.changeSelected(w.id, w.name);
            })}>
                {w.name}
            </div>);

        }

        return <div className="tabs">
            {tabs}
        </div>
    }

    createTypeTabs(){

        if(this.state.mode !== 1) return null;

        const types = this.props.types;

        const typeTabs = [];

        for(let i = 0; i < types.length; i++){

            const {name, display} = types[i];

            if(!this.bAnyDataType(this.state.selected, name)) continue;

            const className = `tab ${(this.state.statType === name) ? "tab-selected": ""}`;

            typeTabs.push(<div key={name} className={className} onClick={(() =>{
                this.changeStatType(name, display);
            })}>{display}</div>);
        }

        return <div className="tabs">
            {typeTabs}
        </div>

    }

    createTableTabs(){

        if(this.state.mode !== 0) return null;

        return <div className="tabs">
            <div className={`tab ${(this.state.tableViewMode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                this.changeTableView(0);
            })}>All Weapons</div>
            <div className={`tab ${(this.state.tableViewMode === 1) ? "tab-selected" : ""}`}  onClick={(() =>{
                this.changeTableView(1);
            })}>Single Weapon</div>
        </div>
    }

    renderTabs(){

        const modeTabs = <div className="tabs">
            <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                this.changeMode(0);
            })}>Table View</div>
            <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`}  onClick={(() =>{
                this.changeMode(1);
            })}>Bar Charts</div>
        </div>;


        const tabs = this.createWeaponNameTabs();

        const typeTabs = this.createTypeTabs();

        const tableTabs = this.createTableTabs();

        return <div>
            {modeTabs}
            {tableTabs}
            {tabs}
            {typeTabs}     
        </div>
    }

    renderBarChart(){

        if(this.state.mode !== 1) return null;

        const data = this.getWeaponData();

        return <div>
            <BarChart title={this.state.selectedName} label={this.state.statTypeTitle} values={data.values} names={data.names}/>
        </div>
    }

    renderEverythingTable(){

        if(this.state.mode !== 0) return null;

        const headers = {
            "name": "Player",
            "weapon": "Weapon",
            "shots": "Shots",
            "hits": "Hits",
            "accuracy": "Accuracy",
            "deaths": "Deaths",
            "kills": "Kills",
            "damage": "Damage"
        };

        const data = [];

        for(let i = 0; i < this.props.playerData.length; i++){

            const d = this.props.playerData[i];

            const player = Functions.getPlayer(this.props.players, d.player_id);

            const weaponName = this.getWeaponName(d.weapon_id);

            data.push({
                "name": {
                    "value": player.name.toLowerCase(), 
                    "className": `text-left ${Functions.getTeamColor(player.team)}`,
                    "displayValue": <Link href={`/pmatch/${this.props.matchId}/?player=${d.player_id}`}>
                        <a>
                            <CountryFlag country={player.country}/>
                            {player.name}
                        </a>
                    </Link>
                },
                "weapon":{
                    "value": weaponName.toLowerCase(),
                    "displayValue": weaponName
                },
                "shots": {"value": d.shots, "displayValue": Functions.ignore0(d.shots)},
                "hits": {"value": d.hits, "displayValue": Functions.ignore0(d.hits)},
                "accuracy": {"value": d.accuracy, "displayValue": `${d.accuracy.toFixed(2)}%`},
                "deaths": {"value": d.deaths, "displayValue": Functions.ignore0(d.deaths)},
                "kills": {"value": d.kills, "displayValue": Functions.ignore0(d.kills)},
                "damage": {"value": d.damage, "displayValue": Functions.ignore0(d.damage)},
            });
        }

        return <InteractiveTable width="1" headers={headers} data={data}/>
    }

    renderSingleTable(weaponId, weaponName){

        const headers = {
            "name": "Player",
            "shots": "Shots",
            "hits": "Hits",
            "accuracy": "Accuracy",
            "deaths": "Deaths",
            "kills": "Kills",
            "damage": "Damage"
        };


        const data = [];

        for(let i = 0; i < this.props.playerData.length; i++){

            const d = this.props.playerData[i];

            if(d.weapon_id !== weaponId) continue;

            const player = Functions.getPlayer(this.props.players, d.player_id);

            data.push({
                "name": {
                    "value": player.name.toLowerCase(), 
                    "className": `text-left ${Functions.getTeamColor(player.team)}`,
                    "displayValue": <Link href={`/pmatch/${this.props.matchId}/?player=${d.player_id}`}>
                        <a>
                            <CountryFlag country={player.country}/>
                            {player.name}
                        </a>
                    </Link>
                },
                "shots": {"value": d.shots, "displayValue": Functions.ignore0(d.shots)},
                "hits": {"value": d.hits, "displayValue": Functions.ignore0(d.hits)},
                "accuracy": {"value": d.accuracy, "displayValue": `${d.accuracy.toFixed(2)}%`},
                "deaths": {"value": d.deaths, "displayValue": Functions.ignore0(d.deaths)},
                "kills": {"value": d.kills, "displayValue": Functions.ignore0(d.kills)},
                "damage": {"value": d.damage, "displayValue": Functions.ignore0(d.damage)},
            });
        }


        return <InteractiveTable key={weaponId} width="1" title={weaponName} headers={headers} data={data}/>
    }

    renderEveryWeaponTable(){

        if(this.state.mode !== 0) return null;
        if(this.state.tableViewMode !== 0) return null;

        const tables = [];

        for(let i = 0; i < this.props.weaponNames.length; i++){

            const w = this.props.weaponNames[i];

            tables.push(this.renderSingleTable(w.id, w.name));

        }

        return tables;
    }

    renderSingleWeaponTable(){

        return this.renderSingleTable(this.state.selected, this.state.selectedName);
    }

    render(){

        return <div>
            <div className="default-header">Weapon Statistics</div>
            {this.renderTabs()}
            {this.renderBarChart()}
            {this.renderEveryWeaponTable()}
            {this.renderSingleWeaponTable()}
        </div>
    }
}

export default MatchWeaponSummaryCharts;