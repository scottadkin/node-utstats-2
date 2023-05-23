import React from 'react';
import Image from 'next/image';
import styles from './PlayerMatchMonsters.module.css';

class PlayerMatchMonsters extends React.Component{

    constructor(props){
        super(props);
    }

    getImageUrl(className){

        if(this.props.images[className] === undefined){
            return "default.png";
        }

        return this.props.images[className];
    }

    getMonsterTotalDeaths(id){

        for(let i = 0; i < this.props.monsterTotals.length; i++){

            const m = this.props.monsterTotals[i];

            if(m.monster === id) return m.deaths;
        }

        return 0;
    }

    getMonsterDeaths(id){

        let p = 0;

        for(let i = 0; i < this.props.playerData.length; i++){

            p = this.props.playerData[i];

            if(p.monster === id) return p.kills;
        }

        return 0;
    }

    renderMonsters(){

        const elems = [];

        let m = 0;

        let currentImage = "";
        let currentKills = 0;
        let monsterTotalDeaths = 0;
        let percent = 0;

        for(let i = 0; i < this.props.monsters.length; i++){

            m = this.props.monsters[i];

            currentImage = this.getImageUrl(m.class_name);
            currentKills = this.getMonsterDeaths(m.id);
            monsterTotalDeaths = this.getMonsterTotalDeaths(m.id);

            percent = 0;

            if(monsterTotalDeaths > 0 && currentKills > 0){
                
                percent =  (100 / monsterTotalDeaths) * currentKills;
            }

            elems.push(
                <div key={i} className={styles.box}>
                    <div className={styles.name}>{m.display_name}</div>
                    <Image src={`/images/monsters/${currentImage}`} alt="image" width="200" height="200"/>
                    <div className={styles.kills}>
                        {currentKills} Kill{(currentKills === 1) ? null : "s"}
                    </div>
                    <div className={styles.kpercent}>
                        {percent.toFixed(2)}% of Kills in Match
                    </div>
                </div>
            );
        }

        return elems;
    }

    render(){

        return <div className="m-bottom-25">
            <div className="default-header">Monster Stats</div>

            <div className={`${styles.wrapper} center`}>
                {this.renderMonsters()}
            </div>
        </div>
    }
}


export default PlayerMatchMonsters;