import React from "react";
import Graph from "../Graph";
import CustomGraph from "../CustomGraph";
import { MMSS } from "../../api/generic.mjs";

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
            "teamsSuicides": [],
            "teammateKills": [],
            "data": null
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

        if(this.state.data === null) return null;

        const tabs = [
            {"name": "Kills", "title": "Kills"},
            {"name": "Deaths", "title": "Deaths"},
            {"name": "Suicides", "title": "Suicides"},
            {"name": "Team Kills", "title": "Team Kills"},
            {"name": "Efficiency", "title": "Efficiency"},
        ];

        const labels = [
            this.state.data.kills.labels, 
            this.state.data.deaths.labels, 
            this.state.data.suicides.labels, 
            this.state.data.teammateKills.labels, 
            this.state.data.efficiency.labels
        ];

        const graphData = [
            this.state.data.kills.data, 
            this.state.data.deaths.data, 
            this.state.data.suicides.data, 
            this.state.data.teammateKills.data, 
            this.state.data.efficiency.data
        ];

        if(this.props.teams > 1){

            const teamsTitles = ["Team Total Kills", "Team Total Deaths", "Team Total Suicides", "Team Total TeamKills", "Team Efficiency"];

            for(let i = 0; i < this.props.teams; i++){
                tabs.push({"name": teamsTitles[i], "title": teamsTitles[i]});
            }

            const teamsData = [
                this.state.data.teamKills.data, 
                this.state.data.teamDeaths.data, 
                this.state.data.teamSuicides.data, 
                this.state.data.teamsTeammateKills.data,
                this.state.data.teamEfficiency.data
            ];

            const teamsLabels = [
                this.state.data.teamKills.labels, 
                this.state.data.teamDeaths.labels, 
                this.state.data.teamSuicides.labels, 
                this.state.data.teamsTeammateKills.labels,
                this.state.data.teamEfficiency.labels
            ];

            graphData.push(...teamsData);
            labels.push(...teamsLabels);
        }

        const testData = {
            "data": graphData,
            "labels": labels,
            "labelsPrefix": [
                "Player Kills @ ",
                "Cat Noise"
            ]
        };



        return <div>
            <div className="default-header">Frags Graph</div>

            <CustomGraph data={testData.data} tabs={tabs} labels={testData.labels} labelsPrefix={testData.labelsPrefix}/>
           
        </div>
    }
}

export default MatchFragsGraph;