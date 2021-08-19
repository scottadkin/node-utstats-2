import Functions from '../../../api/functions';
import React from 'react';
import styles from './PlayerWeaponStats.module.css';


class PlayerWeaponStats extends React.Component{

    constructor(props){

        super(props);
        this.state = {"page": 0, "perPage": 8};

        this.changePage = this.changePage.bind(this);
    }

    changePage(page){

        if(page < 0) page = 0;

        const max = Math.ceil(this.props.data.length / this.state.perPage);

        if(page >= max) page = max - 1;

        this.setState({"page": page});
    }

    render(){
       
        const data = this.props.data;
        const pages = (data.length > 0) ? Math.ceil(data.length / this.state.perPage) : 1;

        const rows = [];

        let start = this.state.page * this.state.perPage;
        if(start < 0) start = 0;

        const end = (start + this.state.perPage < data.length) ? start + this.state.perPage : data.length;

        for(let i = start; i < end; i++){

            const d = data[i];
            let accuracy = 0;

            if(d.shots === 0 && d.hits > 0) accuracy = 100;
            if(d.shots > 0 && d.hits > 0) accuracy = (d.hits / d.shots) * 100;

            rows.push(<tr key={i}>
                <td>{d.name}</td>
                <td>{Functions.ignore0(d.kills)}</td>
                <td>{Functions.ignore0(d.shots)}</td>
                <td>{Functions.ignore0(d.hits)}</td>
                <td>{accuracy.toFixed(2)}%</td>
                <td>{Functions.ignore0(Functions.cleanDamage(d.damage))}</td>
            </tr>);
        }


        return <div className="m-bottom-25">
            <div className="default-header">Weapon Stats</div>
            <div className={`${styles.wrapper} center`}>
                <div className={`${styles.previous} ${styles.button}`} onClick={(() =>{
                    this.changePage(this.state.page - 1);
                })}>
                    Previous
                </div>
                <div className={styles.info}>
                    Displaying page {this.state.page + 1} of {pages}
                </div>
                <div className={`${styles.next} ${styles.button}`} onClick={(() =>{
                    this.changePage(this.state.page + 1);
                })}>
                    Next
                </div>
            </div>
            <table className={`t-width-1 td-1-left ${styles.table}`}>
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Kills</th>
                        <th>Shots</th>
                        <th>Hits</th>
                        <th>Accuracy</th>
                        <th>Damage</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>

    }
}

export default PlayerWeaponStats;