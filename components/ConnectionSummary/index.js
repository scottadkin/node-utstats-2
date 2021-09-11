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
        let graphTextData = [""];
    
        if(this.props.totalTeams > 0){
    
            for(let i = 0; i < this.props.totalTeams; i++){
                graphData.push({"name": `${Functions.getTeamName(i, true)} Players`, "data": [0]});
            }
    
           // graphData.push({"name": "Spectators", "data": [0]});
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
        let currentTeam = 0;

        for(let i = 0; i < this.props.data.length; i++){
    
            const d = this.props.data[i];
    
            const currentPlayer = Functions.getPlayer(this.props.playerNames, d.player);

            if(this.props.totalTeams > 0){

                //check for disconnects
            
                currentTeam = this.getMatchingTeamData(d.timestamp, d.player);

                

                if(currentTeam !== null){

                    if(currentTeam === 255){
                        continue;
                        //currentTeam = graphData.length - 2;
                    }

                    const lastIndex = graphData[currentTeam].data.length - 1;
                    const lastValue = graphData[currentTeam].data[lastIndex];

                    graphData[currentTeam].data.push(lastValue + 1);
                    graphTextData.push(`${Functions.MMSS(d.timestamp - this.props.matchStart)}: ${currentPlayer.name} Joined the server`);

                }else{

                    //console.log(`Team before leaving ${this.getTeamBeforeLeaving(d.timestamp, d.player)}`);
                    currentTeam = this.getTeamBeforeLeaving(d.timestamp, d.player);

                    if(currentTeam === 255){
                        continue;
                        //currentTeam = graphData.length - 2;
                    }
                
                    //if(currentTeam === 255) continue;
                    graphData[currentTeam].data.push(graphData[currentTeam].data[graphData[currentTeam].data.length - 1] - 1);
                    graphTextData.push(`${Functions.MMSS(d.timestamp - this.props.matchStart)}: ${currentPlayer.name} Left the server`);

                }

                updateOthers(currentTeam);

                if(d.event === 0){
                    totalPlayers++;
                }else{
                    totalPlayers--;
                }

                graphData[graphData.length - 1].data.push(totalPlayers);

            }else{

                if(d.event === 0){
                    totalPlayers++;
                    graphTextData.push(`${Functions.MMSS(d.timestamp - this.props.matchStart)}: ${currentPlayer.name} Joined the server`);
                }else{
                    totalPlayers--;
                    graphTextData.push(`${Functions.MMSS(d.timestamp - this.props.matchStart)}: ${currentPlayer.name} left the server`);
                }

                graphData.data.push(totalPlayers);
            }
        }


        if(graphData.length === undefined){
            return {"data": [graphData], "text": graphTextData};
        }else{
            return {"data": graphData, "text": graphTextData};
        }
    }

    render(){

        const graphData = this.createGraphData(this.props.data, this.props.totalTeams);

        return (
          
            <Graph title="Players Connected to Server" data={JSON.stringify(graphData.data)} text={JSON.stringify(graphData.text)}/>
                
        );
    }
}

export default ConnectionSummary;