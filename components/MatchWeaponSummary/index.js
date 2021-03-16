import React from 'react';
import MatchWeapon from '../MatchWeapon/';
import styles from './MatchWeaponSummary.module.css';
import CleanDamage from '../CleanDamage/';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';



class MatchWeaponSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"tabs": []};

        this.changeTab = this.changeTab.bind(this);

        
    }

    componentDidMount(){

        this.createTabs();
    }

    checkWeaponsData(){

        const found = [];

        let d = 0;
        let p = 0;

        for(let i = 0; i < this.props.data.names.length; i++){

            d = this.props.data.names[i];

            console.log(d);

            for(let x = 0; x < this.props.data.playerData.length; x++){

                p = this.props.data.playerData[x];

                if(p.kills !== 0 || p.deaths !== 0 || p.accuracy != 0 || p.shots !== 0 || p.hits !== 0 || p.damage !== 0){

                    if(found.indexOf(p.weapon_id) === -1){
                        found.push(p.weapon_id);
                    }
                }
            }
        }

        return found;

    }

    getWeaponName(id){


        let d = 0;

        for(let i = 0; i < this.props.data.names.length; i++){

            d = this.props.data.names[i];

            if(d.id === id){
                return d.name;
            }
        }

        return 'Not Found';
    }

    createTabs(){

        const tabs = [];
        let weapon = 0;

        const found = this.checkWeaponsData();

        for(let i = 0; i < found.length; i++){

            tabs.push({"name": this.getWeaponName(found[i]), "id": found[i]});
        }
        

        this.setState({"tabs": tabs, "selected": 0});
    
    }

    changeTab(id){

        this.setState({"selected": id});
    }

    getTabs(){

        const elems = [];

        let t = 0;
        let style = "";

        for(let i = 0; i < this.state.tabs.length; i++){

            t = this.state.tabs[i];

            if(this.state.selected === i){
                style = `${styles.tab} ${styles.selected}`;
            }else{
                style = styles.tab;
            }

            elems.push(<div key={i} onClick={(() =>{
                this.changeTab(i);
            })} className={style}>{t.name}</div>);
        }

        return elems;
    }


    //any data for current player
    bAnyData(data){

        const types = ["kills","deaths","accuracy","shots","hits","damage"];

        for(let i = 0; i < types.length; i++){

            if(data[types[i]] > 0)  return true;
        }

        return false;
    }


    getPlayer(id){
        
        let p = 0;

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];

            if(p.id === id){
                return p;
            }
        }

        return {"name": "Not Found", "country": "xx", "id": -1, "team": 255};
    }

    getDataElems(){

        const id = this.state.tabs[this.state.selected].id;

        const elems = [];

        let p = 0;

        let accuracy = 0;
        let efficiency = 0;
        let player = 0;

        const sortedProps = this.props.data.playerData;

        sortedProps.sort((a, b) =>{


            if(a.kills > b.kills){
                return -1;
            }else if(a.kills < b.kills){
                return 1;
            }else{

                if(a.deaths < b.deaths){
                    return -1;
                }else if(a.deaths > b.deaths){
                    return 1;
                }
            }

            return 0;

        });

        let bgColor = "team-none";

        for(let i = 0; i < sortedProps.length; i++){

            p = sortedProps[i];

            if(p.weapon_id === id){

                if(this.bAnyData(p)){

                    accuracy = Functions.ignore0(p.accuracy);

                    if(accuracy !== ''){
                        accuracy = `${accuracy.toFixed(2)}%`;
                    }

                    efficiency = 0;

                    if(p.kills > 0 && p.deaths === 0){
                        efficiency = 100;
                    }else if(p.kills > 0 && p.deaths > 0){
                        efficiency = (p.kills / (p.kills + p.deaths)) * 100;
                    }

                    efficiency = Functions.ignore0(efficiency);

                    if(efficiency !== '') efficiency = `${efficiency.toFixed(2)}%`;

                    player = this.getPlayer(p.player_id);

                    if(this.props.bTeamGame > 0){
                        bgColor = Functions.getTeamColor(player.team);
                    }

                    elems.push(
                        <tr key={i} className={bgColor}>
                            <td><CountryFlag country={player.country}/><Link href={`/player/${player.id}`}><a>{player.name}</a></Link></td>
                            <td>{Functions.ignore0(p.shots)}</td>
                            <td>{Functions.ignore0(p.hits)}</td>
                            <td>{accuracy}</td>
                            <td>{Functions.ignore0(p.deaths)}</td>
                            <td>{Functions.ignore0(p.kills)}</td>
                            <td>{efficiency}</td>
                            <td><CleanDamage damage={p.damage} /></td>
                        </tr>
                    );
                }
            }
        }

        if(elems.length > 0){

            return <table>
                <tbody>
                    <tr>
                        <th>Player</th>
                        <th>Shots</th>
                        <th>Hits</th>
                        <th>Accuracy</th>
                        <th>Deaths</th>
                        <th>Kills</th>
                        <th>Efficiency</th>
                        <th>Damage</th>
                    </tr>
                    {elems}
                </tbody>
            </table>
        }

        return <div>No Data</div>;
    }

    render(){

        const tabs = this.getTabs();

        let dataElems = [];

        if(this.state.selected !== undefined){
            dataElems = this.getDataElems();
        }

        return <div className={styles.wrapper}>
            <div className="default-header">Weapon Statistics</div>
            <div className={styles.tabs}>
                {tabs}
            </div>
            {dataElems}
        </div>
    }
}


export default MatchWeaponSummary;