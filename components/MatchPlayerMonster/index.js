import React from "react";
import styles from "./MatchPlayerMonster.module.css";
import Image from "next/image";
import Table2 from "../Table2";

class MatchPlayerMonster extends React.Component{

    constructor(props){

        super(props);
    }


    render(){

        const p = this.props.monster;

        return <div className={styles.wrapper}>
            <div className={styles.title}>
                {p.displayName}
            </div>
            <div className={styles.image}>
                <Image src={`/images/monsters/${this.props.image}`} width={150} height={150}/>
            </div>
            <div className={styles.table}>
                <Table2 noBottomMargin={true}>
                    <tr>
                        <th>Kills</th>
                        <th>Deaths</th>
                    </tr>
                    <tr>
                        <td>{this.props.stats.kills}</td>
                        <td>{this.props.stats.deaths}</td>
                    </tr>
                </Table2>
            </div>
        </div>
    }
}

export default MatchPlayerMonster;