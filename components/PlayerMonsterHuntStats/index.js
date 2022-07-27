import React from 'react';
import Table2 from '../Table2';

class PlayerMonsterHuntStats extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        let kdRatio = 0;

        const kills = this.props.kills;
        const deaths = this.props.totalDeaths;

        if(kills > 0){

            if(deaths === 0){
                kdRatio = kills;
            }else{
                kdRatio = (kills / deaths).toFixed(2);
            }
        }

        return <>
            <div className="default-header">MonsterHunt Stats</div>
            <Table2 width={1}>
                <tr>
                    <th>Total Kills</th>
                    <th>Most Kills in a Match</th>
                    <th>Most Kills in a Single Life</th>
                    <th>Total Deaths</th>
                    <th>Most Deaths in a Match</th>
                    <th>Kill:Death Ratio</th>
                </tr>
                <tr>
                    <td>{kills}</td>
                    <td>{this.props.bestKills}</td>
                    <td>{this.props.bestKillsLife}</td>
                    <td>{deaths}</td>
                    <td>{this.props.mostDeaths}</td>
                    <td>{kdRatio}</td>
                </tr>
            </Table2>
        </>
    }
}

export default PlayerMonsterHuntStats;