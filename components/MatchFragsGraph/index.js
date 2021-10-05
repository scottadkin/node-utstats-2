import React from 'react';
import Graph from '../Graph';
import Functions from '../../api/functions';

class MatchFragsGraph extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "kills": [], 
            "deaths": [], 
            "suicides": [], 
            "finishedLoading": false, 
            "teamsKills": [], 
            "teamsDeaths": [],
            "teamsSuicides": []
        };
    }

    async loadKills(){

        try{

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "kills", "matchId": this.props.matchId, "players": this.props.players, "teams": this.props.teams})
            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"data": res.data});
             //   this.convertKillData(res.data);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadKills();
        this.setState({"finishedLoading": true});
    }

    render(){

        if(!this.state.finishedLoading) return null;

        const graphTitles = ["Kills", "Deaths", "Suicides",];
        const graphData = [this.state.data.kills, this.state.data.deaths, this.state.data.suicides];


        const teamsTitles = ["Team Total Kills", "Team Total Deaths", "Team Total Suicides"];
        const teamsData = [this.state.data.teamKills, this.state.data.teamDeaths, this.state.data.teamSuicides];

        if(this.props.teams > 1){

            graphTitles.push(...teamsTitles);
            graphData.push(...teamsData);

        }

        return <div>
            <div className="default-header">Frags Graph</div>
            <Graph 
                title={graphTitles} 
                data={JSON.stringify(graphData)}
            />
        </div>
    }
}

export default MatchFragsGraph;