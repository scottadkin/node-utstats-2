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

        const teamTotals = [];

        let teamsToCreate = this.props.totalTeams;
        if(teamsToCreate === 0){
            teamsToCreate = 1;
        }

        for(let i = 0; i < teamsToCreate; i++){

            teamTotals.push(
                {
                    "kills": 0,
                    "deaths": 0,
                    "shots": 0,
                    "hits": 0,
                    "damage": 0,
                }
            );
        }
        

        let currentTeam = 0;
        let currentAccuracy = 0;
        let currentEfficiency = 0;

        for(let i = 0; i < this.props.data.playerData.length; i++){

            p = this.props.data.playerData[i];

            if(p.weapon_id === weapon.id){

                currentPlayer = this.getPlayer(p.player_id);

                if(this.props.totalTeams < 2){
                    currentTeam = 0;
                }else{
                    currentTeam = currentPlayer.team;
                }

                if(teamTotals[currentTeam] === undefined) continue;

                teamTotals[currentTeam].kills += p.kills;
                teamTotals[currentTeam].deaths += p.deaths;
                teamTotals[currentTeam].shots += p.shots;
                teamTotals[currentTeam].hits += p.hits;
                teamTotals[currentTeam].damage += p.damage;

                efficiency = 0;

                if(p.kills > 0){

                    if(p.deaths === 0){
                        efficiency = 1;
                    }else{
                        efficiency = p.kills / (p.kills + p.deaths);
                    }

                    efficiency *= 100;
                }

                currentAccuracy = "";
                currentEfficiency = "";

                if(p.accuracy > 0) currentAccuracy = `${p.accuracy.toFixed(2)}%`;

                if(p.kills > 0){

                    if(p.deaths === 0) {
                        currentEfficiency = 1;
                    }else{
                        currentEfficiency = p.kills / (p.deaths + p.kills);
                    }

                    currentEfficiency *= 100;

                    currentEfficiency = `${currentEfficiency.toFixed(2)}%`;

                }
               

                elems.push(<tr key={i}>
                    <td className={Functions.getTeamColor((this.props.totalTeams < 2) ? 255 : currentTeam)}>
                        <Link href={`/player/${p.player_id}`}>
                            <a>
                                <CountryFlag country={currentPlayer.country}/>{currentPlayer.name}
                            </a>
                        </Link>
                    </td>
                    <td>{Functions.ignore0(p.kills)}</td>
                    <td>{Functions.ignore0(p.deaths)}</td>
                    <td>{currentEfficiency}</td>
                    <td>{Functions.ignore0(p.shots)}</td>
                    <td>{Functions.ignore0(p.hits)}</td>
                    <td>{currentAccuracy}</td>
                    <td>{Functions.ignore0(p.damage)}</td>
                </tr>);
            }
        }


        if(this.props.players.length > teamTotals.length){
            
            for(let i = 0; i < teamTotals.length; i++){

                currentAccuracy = "";
                currentEfficiency = "";

                if(teamTotals[i].kills > 0){

                    if(teamTotals[i].deaths === 0){
                        currentEfficiency = 1;
                    }else{
                        currentEfficiency = teamTotals[i].kills / (teamTotals[i].deaths + teamTotals[i].kills);
                    }

                    currentEfficiency *= 100;

                    currentEfficiency = `${currentEfficiency.toFixed(2)}%`;
                }

                if(teamTotals[i].hits > 0 && teamTotals[i].shots > 0){

                    currentAccuracy = teamTotals[i].hits / teamTotals[i].shots;

                    currentAccuracy *= 100;

                    currentAccuracy = `${currentAccuracy.toFixed(2)}%`;
                }

                elems.push(<tr key={`team-totals-${i}`} className={`yellow`}>
                    <td>
                        {(this.props.totalTeams < 2) ? "Totals" : Functions.getTeamName(i)}
                    </td>
                    <td>{Functions.ignore0(teamTotals[i].kills)}</td>
                    <td>{Functions.ignore0(teamTotals[i].deaths)}</td>
                    <td>{currentEfficiency}</td>
                    <td>{Functions.ignore0(teamTotals[i].shots)}</td>
                    <td>{Functions.ignore0(teamTotals[i].hits)}</td>
                    <td>{currentAccuracy}</td>
                    <td>{Functions.ignore0(teamTotals[i].damage)}</td>
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
        let currentTeam = 0;

        let currentTeamTotals = [];

        let teamsToCreate = this.props.totalTeams;

        if(teamsToCreate === 0) teamsToCreate = 1;

        let p = 0;

        for(let i = 0; i < this.props.data.names.length; i++){

            currentPlayers = [];
            currentWeapon = this.props.data.names[i];

            currentTeamTotals = [];

            for(let x = 0; x < teamsToCreate; x++){

                currentTeamTotals.push(
                    {
                        "kills": 0,
                        "deaths": 0,
                        "shots": 0,
                        "hits": 0,
                        "damage": 0
                    }
                );
            }
            

            for(let x = 0; x < this.props.data.playerData.length; x++){

                p = this.props.data.playerData[x];

                if(p.weapon_id !== currentWeapon.id) continue;

                currentPlayer = this.getPlayer(p.player_id);

                currentTeam = currentPlayer.team;

                if(this.props.totalTeams < 2){
                    currentTeam = 0;
                }

                currentTeamTotals[currentTeam].kills += p.kills;
                currentTeamTotals[currentTeam].deaths += p.deaths;
                currentTeamTotals[currentTeam].shots += p.shots;
                currentTeamTotals[currentTeam].hits += p.hits;
                currentTeamTotals[currentTeam].damage += p.damage;

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
                        <td className={Functions.getTeamColor((this.props.totalTeams < 2) ? 255 : currentTeam)}>
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


            if(this.props.players.length > currentTeamTotals.length){
                for(let x = 0; x < currentTeamTotals.length; x++){

                    currentEfficiency = "";
                    currentAccuracy = "";

                    if(currentTeamTotals[x].hits > 0 && currentTeamTotals[x].shots){

                        currentAccuracy = currentTeamTotals[x].hits / currentTeamTotals[x].shots;
                    
                        currentAccuracy *= 100;

                        currentAccuracy = `${currentAccuracy.toFixed(2)}%`;
                    }

                    if(currentTeamTotals[x].kills > 0){

                        if(currentTeamTotals[x].deaths === 0){
                            currentEfficiency = 1;
                        }else{
                            currentEfficiency = currentTeamTotals[x].kills / (currentTeamTotals[x].kills + currentTeamTotals[x].deaths);
                        }

                        currentEfficiency *= 100;

                        currentEfficiency = `${currentEfficiency.toFixed(2)}%`;
                    }

                    currentPlayers.push(
                        <tr key={`team-totals ${x}`} className="yellow">
                            <td>
                                {(this.props.totalTeams < 2) ? "Totals" : Functions.getTeamName(x)}
                            </td>
                            <td>{Functions.ignore0(currentTeamTotals[x].kills)}</td>
                            <td>{Functions.ignore0(currentTeamTotals[x].deaths)}</td>
                            <td>{currentEfficiency}</td>
                            <td>{Functions.ignore0(currentTeamTotals[x].shots)}</td>
                            <td>{Functions.ignore0(currentTeamTotals[x].hits)}</td>
                            <td>{currentAccuracy}</td>
                            <td>{Functions.ignore0(currentTeamTotals[x].damage)}</td>
        
                        </tr>
                    );

                }
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

        if(this.props.data.names.length === 0) return null;

        return <div className="m-bottom-25">
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