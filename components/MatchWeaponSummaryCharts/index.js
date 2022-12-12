import React from "react";
import BarChart from "../BarChart";

class MatchWeaponSummaryCharts extends React.Component{

    constructor(props){

        super(props);
        this.state = {"selected": null, "statType": "kills", "statTypeTitle": "Kills"};     
    }

    changeSelected(id){

        this.setState({"selected": id});

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
            this.changeSelected(this.props.weaponNames[0].id);
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

    renderTabs(){

        const tabs = [];


        for(let i = 0; i < this.props.weaponNames.length; i++){

            
            const w = this.props.weaponNames[i];
            if(!this.bAnyData(w.id)) continue;

            const className = `tab ${(this.state.selected === w.id) ? "tab-selected": ""}`;

            tabs.push(<div key={w.id} className={className} onClick={(() =>{
                this.changeSelected(w.id);
            })}>
                {w.name}
            </div>);

        }

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

        return <div>
            <div className="tabs">
                {tabs}
            </div>
            <div className="tabs">
                {typeTabs}
            </div>
        </div>
    }

    renderData(){

        const data = this.getWeaponData();

        return <div>
  
            <BarChart title="Selected Weapon" label={this.state.statTypeTitle} values={data.values} names={data.names}/>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Weapon Statistics</div>
            {this.renderTabs()}
            {this.renderData()}
        </div>
    }
}

export default MatchWeaponSummaryCharts;