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

        this.state = {"tab": 0, "mode": 0};

        this.changeTab = this.changeTab.bind(this);
        this.changeMode = this.changeMode.bind(this);
    }

    changeTab(type){


        if(type === 0){

            if(this.state.tab > 0){
                this.setState({"tab": this.state.tab - 1});
            }
        }else{

            if(this.state.tab < this.props.data.names.length - 1){
                this.setState({"tab": this.state.tab + 1});
            }
        }
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    getPlayer(id){

        let p = 0;

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];

            if(p.id === id) return p;
            
        }
        return {"name": "Not Found", "country": "xx", "team": 255}
    }

    displayData(){

        if(this.state.mode !== 0) return null;

        const weapon = this.props.data.names[this.state.tab];

        const elems = [];

        let p = 0;

        let efficiency = 0;

        let currentPlayer = 0;

        for(let i = 0; i < this.props.data.playerData.length; i++){

            p = this.props.data.playerData[i];

            if(p.weapon_id === weapon.id){

                currentPlayer = this.getPlayer(p.player_id);

                efficiency = 0;

                if(p.kills > 0){

                    if(p.deaths === 0){
                        efficiency = 1;
                    }else{
                        efficiency = p.kills / (p.kills + p.deaths);
                    }

                    efficiency *= 100;
                }

                elems.push(<tr key={i}>
                    <td className={Functions.getTeamColor(currentPlayer.team)}>
                        <Link href={`/player/${p.player_id}`}>
                            <a>
                                <CountryFlag country={currentPlayer.country}/>{currentPlayer.name}
                            </a>
                        </Link>
                    </td>
                    <td>{Functions.ignore0(p.kills)}</td>
                    <td>{Functions.ignore0(p.deaths)}</td>
                    <td>{efficiency.toFixed(2)}%</td>
                    <td>{Functions.ignore0(p.shots)}</td>
                    <td>{Functions.ignore0(p.hits)}</td>
                    <td>{p.accuracy.toFixed(2)}%</td>
                    <td>{Functions.ignore0(p.damage)}</td>
                </tr>);
            }
        }



        return <table className={`t-width-1 ${styles.table}`}>
            <tbody>
                <tr>
                    <th>Player</th>
                    <th>Kills</th>
                    <th>Deaths</th>
                    <th>Efficiency</th>
                    <th>Shots</th>
                    <th>Hits</th>
                    <th>Accuracy</th>
                    <th>Damage</th>
                </tr>
                {elems}
            </tbody>
        </table>;
    }

    displayAllData(){

        if(this.state.mode !== 1) return null;

        const tables = [];

        let currentPlayers = [];
        let currentWeapon = 0;
        let currentPlayer = 0;
        let currentEfficiency = 0;
        let currentAccuracy = 0;

        let p = 0;

        for(let i = 0; i < this.props.data.names.length; i++){

            currentPlayers = [];
            currentWeapon = this.props.data.names[i];

            for(let x = 0; x < this.props.data.playerData.length; x++){

                p = this.props.data.playerData[x];

                if(p.weapon_id !== currentWeapon.id) continue;

                currentPlayer = this.getPlayer(p.player_id);

                currentEfficiency = "";
                currentAccuracy = "";

                if(p.kills > 0){

                    if(p.deaths === 0){
                        currentEfficiency = 1;
                    }else{
                        currentEfficiency = p.kills / (p.deaths + p.kills);
                    }

                    currentEfficiency *= 100;

                    currentEfficiency = `${currentEfficiency.toFixed(2)}%`;
                }

                if(p.accuracy > 0){

                    currentAccuracy = `${p.accuracy.toFixed(2)}%`;
                }

                currentPlayers.push(
                    <tr key={x}>
                        <td className={Functions.getTeamColor(currentPlayer.team)}>
                            <Link href={`/player/${currentPlayer.id}`}>
                                <a><CountryFlag country={currentPlayer.country}/>{currentPlayer.name}</a>
                            </Link>
                        </td>
                        <td>{Functions.ignore0(p.kills)}</td>
                        <td>{Functions.ignore0(p.deaths)}</td>
                        <td>{Functions.ignore0(currentEfficiency)}</td>
                        <td>{Functions.ignore0(p.shots)}</td>
                        <td>{Functions.ignore0(p.hits)}</td>
                        <td>{currentAccuracy}</td>
                        <td>{Functions.ignore0(p.damage)}</td>
     
                    </tr>
                );
            }

            tables.push(
                <div key={i}>
                    <div className="default-header">{currentWeapon.name}</div>
                    <table className={`t-width-1 m-bottom-10 ${styles.table}`}>
                        <tbody>
                            <tr>
                                <th>Player</th>
                                <th>Kills</th>
                                <th>Deaths</th>
                                <th>Efficiency</th>
                                <th>Shots</th>
                                <th>Hits</th>
                                <th>Accuracy</th>
                                <th>Damage</th>
                            </tr>
                            {currentPlayers}
                        </tbody>
                    </table>
                </div>
            );
        }

        return tables;
    }

    createTabs(){

        if(this.state.mode !== 0) return null;

        return <div className={`${styles.tabs} center`}>
            <div className={`${styles.tab} ${styles.previous}`} onClick={(() =>{
                    this.changeTab(0);
                })}>Previous</div>
            <div className={styles.tab}>
                <div className={styles.name}>
                    {this.props.data.names[this.state.tab].name}
                </div>
                <div className={styles.info}>
                    Displaying Weapon {this.state.tab + 1} of {this.props.data.names.length}
                </div>
            </div>
            <div className={`${styles.tab} ${styles.next}`}  onClick={(() =>{
                    this.changeTab(1);
                })}>Next</div>
        </div>;
    }


    render(){

        return <div className="special-table">
            <div className="default-header">
                Weapon Statistics
            </div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Single Display</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Display All</div>
            </div>
            {this.createTabs()}
            {this.displayData()}
            {this.displayAllData()}
        </div>
    }
}


export default MatchWeaponSummary;