import React from "react";
import styles from "./CapChart.module.css";
import Functions from "../../api/functions";
import MouseOver from "../MouseOver";
import CountryFlag from "../CountryFlag";
import Link from "next/link";
import Table2 from "../Table2";

class CapChart extends React.Component{

    constructor(props){

        super(props);

        console.log(this.props);
    }


    createBarParts(totalTravelTime){

        const barParts = [];

        let lastDropTime = null;

        const totalCarryTimes = this.props.carryTimes.length;

        for(let i = 0; i < this.props.carryTimes.length; i++){

            const c = this.props.carryTimes[i];

            if(lastDropTime !== null){

                let droppedPercent = 0;

                const droppedTime = c.start_time - lastDropTime;

                if(droppedTime > 0){
                    droppedPercent = (droppedTime / totalTravelTime) * 100;
                }

                barParts.push(
                    <div key={`${c.id}-dropped`} className={`${styles["inner-bar"]} ${styles.dropped}`} style={{"width": `${droppedPercent}%`}}>
                        <MouseOver title="Flag Dropped" display={`Flag Dropped for ${droppedTime.toFixed(2)} seconds.`}>&nbsp;</MouseOver>
                    </div>
                );
            }

            let carryPercent = 0;

            if(totalTravelTime > 0 && c.carry_time > 0){
                carryPercent = (c.carry_time / totalTravelTime) * 100;
            }

            const styleClass = (totalCarryTimes === 1) ? styles.solo : styles.carry;

            const player = Functions.getPlayer(this.props.playerData, c.player_id);

            const playerDisplay = <div>
                <CountryFlag country={player.country}/><span className="white">{player.name}</span> carried the flag for {c.carry_time.toFixed(2)} seconds.
            </div>

            barParts.push(<div key={c.id} className={`${styles["inner-bar"]} ${styleClass}`} style={{"width": `${carryPercent}%`}}>
                <MouseOver title="Flag In Possession" display={playerDisplay}>&nbsp;</MouseOver>
            </div>);

            lastDropTime = c.end_time;
        }


        if(barParts.length === 0){
            return <div key="0" className={`${styles["inner-bar"]} ${styles.solo}`} style={{"width": `100%`}}></div>;
        }

        return barParts;
    }

    createTeamScoreElement(){

        const elems = [];

        for(let i = 0; i < this.props.teamScores.length; i++){

            const t = this.props.teamScores[i];

            elems.push(<div key={i} style={{"width": `${100 / this.props.teamScores.length}%`}} className={`${Functions.getTeamColor(i)} ${styles["team-score"]}`}>
                {t}
            </div>);
        }

        return elems;
    }

    renderSoloCap(capPlayer, cap, startTimestamp){

        const capTime = Functions.MMSS(cap.cap_time - startTimestamp);
        const grabTime = Functions.MMSS(cap.grab_time - startTimestamp);

        return <div className={styles.info}>
            Solo cap by <Link href={`/pmatch/${this.props.matchId}/?player=${capPlayer.id}`}>
                
                <CountryFlag country={capPlayer.country}/>{capPlayer.name}
                
            </Link> Grabbed at <span className="playtime">{grabTime}</span> and capped at {capTime}
        </div>;
    }


    renderCovers(){

        const elems = [];

        for(let i = 0; i < this.props.covers.length; i++){

            const c = this.props.covers[i];

            const killer = Functions.getPlayer(this.props.playerData, c.killer_id);
            const victim = Functions.getPlayer(this.props.playerData, c.victim_id);

            const coverString = (c.bSelf) ? "Self Cover" : "Cover";

            elems.push(<tr>
                <td className="timestamp">{Functions.MMSS(c.timestamp - this.props.matchStart)}</td>
                <td>{coverString}</td>
                <td>
                    <Link href={`/pmatch/${this.props.matchId}/?player=${killer.id}`}>
                        
                        <CountryFlag country={killer.country}/>{killer.name}
                        
                    </Link>
                </td>
                <td>Killed</td>
                <td>
                    <Link href={`/pmatch/${this.props.matchId}/?player=${victim.id}`}>
                        
                        <CountryFlag country={victim.country}/>{victim.name}
                        
                    </Link>
                </td>
            </tr>);

            /*elems.push(<div key={c.id}>
                <div className={styles.cover}>Flag Cover</div>
                <div className="timestamp">{Functions.MMSS(c.timestamp - this.props.matchStart)}</div>
                <CountryFlag country={killer.country}/>{killer.name} killed <CountryFlag country={victim.country}/>{victim.name}
            </div>);*/
        }

        return <div className={styles.covers}>
            <Table2 width={1} noBottomMargin={true}>
        
                {elems}
            </Table2>
            
        </div>
    }

    renderInfoElems(){

        const cap = this.props.capInfo;
        const startTimestamp = this.props.matchStart;

        const capPlayer = Functions.getPlayer(this.props.playerData, cap.cap_player);

        /*if(this.props.carryTimes.length === 1){
            return this.renderSoloCap(capPlayer, cap, startTimestamp);
        }*/

        const grabPlayer = Functions.getPlayer(this.props.playerData, cap.grab_player);
        
        const grabElement = <div className={styles.info}>
            Flag was taken by <Link href={`/pmatch/${this.props.matchId}/?player=${grabPlayer.id}`}>
                
                <CountryFlag country={grabPlayer.country}/>{grabPlayer.name}
                
            </Link> at {Functions.MMSS(cap.grab_time - startTimestamp)} 
        </div>;

        const capElement = <div className={styles.info}>
            Flag was capped by <Link href={`/pmatch/${this.props.matchId}/?player=${capPlayer.id}`}>
                
                <CountryFlag country={capPlayer.country}/>{capPlayer.name}
                
            </Link> at {Functions.MMSS(cap.cap_time - startTimestamp)} 
        </div>;

        return <>
            {grabElement}
            {this.renderCovers()}
            {capElement}
        </>
    }

    render(){


        const capTeamName = `${Functions.getTeamName(this.props.capInfo.cap_team)}`;
        const cappedFlagName = Functions.getTeamColorName(this.props.capInfo.flag_team);

        const totalTravelTime = this.props.capInfo.travel_time;

        const barParts = this.createBarParts(totalTravelTime);
        const teamScoreElems = this.createTeamScoreElement();
        
        return <div className={`${styles.wrapper} center`}>
            <div className={styles.title}>The {capTeamName} Capped the {cappedFlagName} Flag</div>
            {teamScoreElems}
            <div className={styles["bar-title"]}>
                Cap Timeline
            </div>
            <div className={styles["bar-wrapper"]}>
                {barParts}
            </div>
            {this.renderInfoElems()}
        </div>
    }
}

export default CapChart;