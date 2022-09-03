import React from "react";
import styles from "./PlayerMonster.module.css";
import Image from "next/image";
import Table2 from "../Table2";

class PlayerMonster extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        const kills = this.props.stats.kills ?? 0;
        const deaths = this.props.stats.deaths ?? 0;

        const matches = this.props.stats.matches ?? 0;
        let average = 0;

        if(matches > 0 && kills > 0){

            average = kills / matches;
            average = average.toFixed(2);
        }

        let averageDeaths = 0;

        if(matches > 0 && deaths > 0){

            averageDeaths = (deaths / matches).toFixed(2);
        }

        let eff = 0;

        if(kills > 0){

            if(deaths > 0){

                eff = ((kills / (kills + deaths)) * 100).toFixed(2);
            }else{
                eff = 100;
            }
        }

        return <div className={styles.wrapper}>
            <div className={styles.title}>{this.props.name ?? "No name supplied"}</div>
            <div className={styles.image}>
                <Image src={`/images/monsters/${this.props.image ?? "default.png"}`} width="130" alt="image" height="130"/>
            </div>
            <Table2 noBottomMargin={true}>
                        <tr>
                            <td>Matches</td>
                            <td>{matches}</td>
                        </tr>
                        <tr>
                            <td>Kills</td>
                            <td>{kills}</td>
                        </tr>
                        <tr>
                            <td>Average Kills</td>
                            <td>{average}</td>
                        </tr>
                        <tr>
                            <td>Deaths</td>
                            <td>{deaths}</td>
                        </tr>
                        <tr>
                            <td>Efficiency</td>
                            <td>{eff}%</td>
                        </tr>
                    </Table2>
        </div>

        /*return <div className={styles.wrapper}>
            <div className={styles.title}>{this.props.name ?? "No name supplied"}</div>
            <div className={styles.split}>
                <div className={styles.image}>
                    <Image src={`/images/monsters/${this.props.image ?? "default.png"}`} width="130" alt="image" height="130"/>
                </div>
                <div className={styles.text}>
                    <Table2>
                        <tr>
                            <td>Matches</td>
                            <td>{matches}</td>
                        </tr>
                        <tr>
                            <td>Kills</td>
                            <td>{kills}</td>
                        </tr>
                        <tr>
                            <td>Average Kills</td>
                            <td>{average}</td>
                        </tr>
                        <tr>
                            <td>Deaths</td>
                            <td>{deaths}</td>
                        </tr>
                        <tr>
                            <td>Efficiency</td>
                            <td>{eff}%</td>
                        </tr>
                    </Table2>
                </div>
            </div>
        </div>*/
    }
}

export default PlayerMonster;