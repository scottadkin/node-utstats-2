import styles from './ConnectionSummary.module.css';
import MMSS from '../MMSS/';
import CountryFlag from '../CountryFlag/';
import Functions from '../../api/functions';
import Graph from '../Graph/';
import React from 'react';

class ConnectionSummary extends React.Component{

    constructor(props){

        super(props);
    }


    getMatchingTeamData(timestamp, player){

        let t = 0;

        for(let i = 0; i < this.props.teamsData.length; i++){

            t = this.props.teamsData[i];

            if(t.timestamp === timestamp && t.player === player){
                return t.team;
            }
        
        }

        return null;
    }

    getTeamBeforeLeaving(timestamp, player){

        let t = 0;

        let currentTeam = 0;

        for(let i = this.props.teamsData.length - 1; i > 0; i--){

            t = this.props.teamsData[i];

            if(t.player === player && t.timestamp > timestamp){
                currentTeam = t.team;
            }else if(t.timestamp < timestamp){
                break;
            }
        }

        return currentTeam;
    }

    createGraphData(){

        let graphData = [];
    
        if(this.props.totalTeams > 0){
    
            for(let i = 0; i < this.props.totalTeams; i++){
                graphData.push({"name": `${Functions.getTeamName(i)} Players`, "data": [0]});
            }
    
            graphData.push({"name": "Total Players", "data": [0]});
    
        }else{
            graphData = {"name": "Total Players", "data": [0]};
        }


        //only needed for team games
        const updateOthers = (ignore) =>{

                
            for(let i = 0; i < this.props.totalTeams; i++){

                if(i !== ignore){
                    graphData[i].data.push(graphData[i].data[graphData[i].data.length - 1]);
                }
            }

        }
     
    
        let totalPlayers = 0;
        let d = 0;
        let currentTeam = 0;
    
        for(let i = 0; i < this.props.data.length; i++){
    
            d = this.props.data[i];
    
            if(this.props.totalTeams > 0){

                //check for disconnects
            
                currentTeam = this.getMatchingTeamData(d.timestamp, d.player);

                if(currentTeam !== null){
                    graphData[currentTeam].data.push(graphData[currentTeam].data[graphData[currentTeam].data.length - 1] + 1);
                }else{

                    console.log(`Team before leaving ${this.getTeamBeforeLeaving(d.timestamp, d.player)}`);
                    currentTeam = this.getTeamBeforeLeaving(d.timestamp, d.player);
                    graphData[currentTeam].data.push(graphData[currentTeam].data[graphData[currentTeam].data.length - 1] - 1);

                }

                updateOthers(currentTeam);

                if(d.event === 0){
                    totalPlayers++;
                }else{
                    totalPlayers--;
                }

                graphData[this.props.totalTeams].data.push(totalPlayers);

            }else{

                if(d.event === 0){
                    totalPlayers++;
                }else{
                    totalPlayers--;
                }

                graphData.data.push(totalPlayers);
            }
        }
    
        console.log(graphData);

        return [graphData];
    }

    render(){

        const graphData = this.createGraphData(this.props.data, this.props.totalTeams);

        const elems = [];
        let currentPlayer = 0;
        let bgColor = '';


        let d = 0;

        for(let i = 0; i < this.props.data.length; i++){

            d = this.props.data[i];

            currentPlayer = Functions.getPlayer(this.props.playerNames, d.player);
            if(this.props.bTeamGame){
                bgColor = Functions.getTeamColor(currentPlayer.team);
            }else{
                bgColor = "team-none";
            }

            elems.push(<tr key={`connection-${i}`} className={bgColor}>
                <td><MMSS timestamp={d.timestamp}/></td>
                <td><a href={`/player/${d.player}`}><CountryFlag country={currentPlayer.country}/>{currentPlayer.name}</a></td>
                <td>{(!d.event) ? "Connected" : "Disconnected"}</td>
            </tr>);
        }

        return (
            <div className={`special-table ${styles.wrapper} center`}>
                <div className="default-header">
                    Player Connections
                </div>

                <Graph title="Players Connected to Server" data={JSON.stringify(graphData)}/>
                <table>
                    <tbody>
                        <tr>
                            <th>Time</th>
                            <th>Player</th>
                            <th>Event</th>
                        </tr>
                        {elems}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default ConnectionSummary;