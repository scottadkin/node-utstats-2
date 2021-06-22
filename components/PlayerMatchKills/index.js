import React from 'react';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import styles from './PlayerMatchKills.module.css';


class PlayerMatchKills extends React.Component{

    constructor(props){

        super(props);
    }


    getKillsDeaths(target){

        let kills = 0;
        let deaths = 0;

        let k = 0;

        for(let i = 0; i < this.props.data.length; i++){

            k = this.props.data[i];

            if(k.killer === target){
     
                if(k.victim !== 0){
                    kills++;
                }
            }

            if(k.victim === target) deaths++;
        }


        return {"kills": kills, "deaths": deaths};
    }

    renderKillsTable(){

        const rows = [];

        let p = 0;

        const players = this.props.players;

        players.sort((a, b) =>{

            a = a.name;
            b = b.name;

            if(a > b){
                return 1;
            }else if(a < b){
                return -1;
            }

            return 0;
        });

        const playerElem = <Link href={`/player/${this.props.player.id}`}>
                <a>
                    <CountryFlag country={this.props.player.country}/>{this.props.player.name}
                </a>
            </Link>
        

        let currentKills = 0;

        for(let i = 0; i < players.length; i++){

            p = players[i];

            if(p.id === this.props.player.id){
                continue;
            }

            currentKills = this.getKillsDeaths(p.id);

            if(currentKills.kills === 0 && currentKills.deaths === 0){
                continue;
            }

            rows.push(<div className={`${styles.row} t-width-2 center`} key={i}>
                <div>{playerElem}</div>
                <div>{Functions.ignore0(currentKills.deaths)}</div>
                <div>{Functions.ignore0(currentKills.kills)}</div>
                <div>
                    <Link href={`/player/${p.id}`}>
                        <a>
                            <CountryFlag country={p.country}/>{p.name}
                        </a>
                    </Link>
                </div>
            </div>);

        }


        return rows;


    }

    render(){

        if(this.props.data.length === 0) return null;

        return <div className="m-bottom-25">
            <div className="default-header">Kills Summary</div>

            {this.renderKillsTable()}
        </div>
    }
}

export default PlayerMatchKills;