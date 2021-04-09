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

        this.state = {"tab": 0};

        this.changeTab = this.changeTab.bind(this);
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

    getPlayer(id){

        let p = 0;

        for(let i = 0; i < this.props.players.length; i++){

            p = this.props.players[i];

            if(p.id === id) return p;
            
        }
        return {"name": "Not Found", "country": "xx", "team": 255}
    }

    displayData(){

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

    createTabs(){

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
            {this.createTabs()}
            {this.displayData()}
        </div>
    }
}


export default MatchWeaponSummary;