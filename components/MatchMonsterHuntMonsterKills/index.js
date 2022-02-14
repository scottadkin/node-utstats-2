import React from 'react';
import styles from './MatchMonsterHuntMonsterKills.module.css';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import Functions from '../../api/functions';
import Image from 'next/image';

class MatchMonsterHuntMonsterKills extends React.Component{

    constructor(props){

        super(props);

        this.state = {"playerData": this.props.playerData.sort((a, b) => {

            a = a.mh_kills;
            b = b.mh_kills;

            if(a < b){
                return 1;
            }else if(a > b){
                return -1;
            }

            return 0;

        })};


    }

    getMonsterId(className){

        let m = 0;

        for(let i = 0; i < this.props.monsterNames.length; i++){

            m = this.props.monsterNames[i];

            if(m.class_name === className){
                return m.id;
            }
        }

        return null;
    }

    getMonsterDisplayName(className){

        let m = 0;

        for(let i = 0; i < this.props.monsterNames.length; i++){

            m = this.props.monsterNames[i];

            if(m.class_name === className){
                return m.display_name;
            }
        }

        return "Not Found";
    }


    getPlayerMonsterKillCount(playerId, monsterId){

        let m = 0;

        for(let i = 0; i < this.props.monsterKills.length; i++){

            m = this.props.monsterKills[i];

            if(m.player === playerId && m.monster === monsterId){
                return m.kills;
            }
        }

        return 0;
    }


    createMonsterPlayerStats(monsterId){

        if(monsterId === null) return null;

        const rows = [];

        let p = 0;

        for(let i = 0; i < this.state.playerData.length; i++){

            p = this.state.playerData[i];

            if(!p.played){
                continue;
            }

            rows.push(<tr key={i}>
                <td><Link href={`/pmatch/${this.props.matchId}?player=${p.player_id}`}><a><CountryFlag host={this.props.host} country={p.country}/>{p.name}</a></Link></td>
                <td>{Functions.ignore0(this.getPlayerMonsterKillCount(p.player_id, monsterId))}</td>
            </tr>);
        }

        return rows;
    }

    getTotalMonsterDeaths(id){

        let total = 0;

        let m = 0;

        for(let i = 0; i < this.props.monsterKills.length; i++){

            m = this.props.monsterKills[i];

            if(m.monster === id){
                total += m.kills;
            }
        }

        return total;
    }

    render(){

        const images = [];

        let monsterId = 0;
        let totalDeaths = 0;


        for(const [className, fileUrl] of Object.entries(this.props.images)){

            monsterId = this.getMonsterId(className);
            totalDeaths = this.getTotalMonsterDeaths(monsterId);

            images.push(
                <div className={styles.box} key={images.length}>
                    <div className={styles.name}>
                        {this.getMonsterDisplayName(className)}
                    </div>
                    <Image src={`/images/monsters/${fileUrl}`} width={150} height={150} alt="monster" className="monster-image"/>
                    <div className={styles.deaths}>{totalDeaths} Death{(totalDeaths === 1) ? null : "s"}</div>
                    <table className={`${styles.table} td-1-left`}>
                        <tbody>
                            <tr>
                                <th>Player</th>
                                <th>Kills</th>
                            </tr>
                            {this.createMonsterPlayerStats(monsterId)}
                        </tbody>
                    </table>
                </div>
            );
        }



        return <div className="m-bottom-25">
            <div className="default-header">Monster Stats</div>
            <div className={`${styles.wrapper} center`}>
                {images}
            </div>
        </div>
    }
}


export default MatchMonsterHuntMonsterKills;