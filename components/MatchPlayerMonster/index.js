import React from "react";
import styles from "./MatchPlayerMonster.module.css";
import Image from "next/image";
import Table2 from "../Table2";
import Functions from "../../api/functions";

class MatchPlayerMonster extends React.Component{

    constructor(props){

        super(props);
    }


    render(){

        const p = this.props.monster;

        let eff = 0;

        const kills = this.props.stats.kills;
        const deaths = this.props.stats.deaths;

        if(kills > 0){

            if(deaths > 0){

                eff = ((kills / (deaths + kills)) * 100).toFixed(2);
            }else{
                eff = 100;
            }
        }

        return <div className={styles.wrapper}>
            <div className={styles.title}>
                {p.displayName}
            </div>
            <div className={styles.image}>
                <Image src={`/images/monsters/${this.props.image}`} alt="monster" width={150} height={150}/>
            </div>
            <div className={styles.table}>
                <Table2 noBottomMargin={true}>
                    <tr>
                        <th>Kills</th>
                        <th>Deaths</th>
                        <th>Efficiency</th>
                    </tr>
                    <tr>
                        <td>{Functions.ignore0(kills)}</td>
                        <td>{Functions.ignore0(deaths)}</td>
                        <td>{eff}%</td>
                    </tr>
                </Table2>
            </div>
        </div>
    }
}

export default MatchPlayerMonster;