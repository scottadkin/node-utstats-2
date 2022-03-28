import React from 'react';
import Table2 from '../Table2';

class PlayerMonsterHuntStats extends React.Component{

    constructor(props){

        super(props);
    }

    render(){

        return <>
            <div className="default-header">MonsterHunt Stats</div>
            <Table2 width={4}>
                <tr>
                    <th>Total Kills</th>
                    <th>Most Kills in a Match</th>
                    <th>Most Kills in a Single Life</th>
                </tr>
                <tr>
                    <td>{this.props.kills}</td>
                    <td>{this.props.bestKills}</td>
                    <td>{this.props.bestKillsLife}</td>
                </tr>
            </Table2>
        </>
    }
}

export default PlayerMonsterHuntStats;