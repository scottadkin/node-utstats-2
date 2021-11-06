import React from 'react';
import Functions from '../../api/functions';
import CleanDamage from '../CleanDamage';
import Table2 from '../Table2';

class PlayerMatchWeapons extends React.Component{

    constructor(props){

        super(props);
    }

    getWeaponName(id){

        let w = 0;

        for(let i = 0; i < this.props.names.length; i++){

            w = this.props.names[i];

            if(w.id === id){
                return w.name;
            }
        }

        return "Not Found";
    }


    createRows(){

        const rows = [];

        let w = 0;

        const data = this.props.data;

        data.sort((a, b) =>{

            a = a.kills;
            b = b.kills;

            if(a > b){
                return -1;
            }else if(a < b){
                return 1;
            }       
            return -1;
        });

        let currentEff = 0;

        for(let i = 0; i < data.length; i++){

            w = data[i];

            currentEff = 0;

            if(w.kills > 0){

                if(w.deaths === 0){
                    currentEff = 100;
                }else{

                    currentEff = (w.kills / (w.kills + w.deaths)) * 100;
                }
            }

            rows.push(<tr key={i}>
                <td className="text-left">{this.getWeaponName(w.weapon_id)}</td>
                <td>{Functions.ignore0(w.kills)}</td>
                <td>{Functions.ignore0(w.deaths)}</td>
                <td>{currentEff.toFixed(2)} %</td>
                <td>{Functions.ignore0(w.shots)}</td>
                <td>{Functions.ignore0(w.hits)}</td>
                <td>{w.accuracy.toFixed(2)}%</td>
                <td>{<CleanDamage damage={w.damage} />}</td>
         
            </tr>);
        }

        return rows;
    }


    render(){

        const rows = this.createRows();

        return <div className="m-bottom-25">
            <div className="default-header">Weapon Statistics</div>
            <Table2 width={1}>
                <tr>
                    <th>Weapon</th>
                    <th>Kills</th>
                    <th>Deaths</th>
                    <th>Efficiency</th>
                    <th>Shots</th>
                    <th>Hits</th>
                    <th>Accuracy</th>
                    <th>Damage</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }
}

export default PlayerMatchWeapons;