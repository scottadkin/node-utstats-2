import React from "react";
import CustomGraph from "../CustomGraph";
import { scalePlaytime, MMSS } from "../../api/generic.mjs";

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

    createLabels(labels){

        return labels.map((d) =>{
            return MMSS(scalePlaytime(d - this.props.startTimestamp, this.props.bHardcore));
        });
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
            this.createLabels(this.state.data.kills.labels), 
            this.createLabels(this.state.data.deaths.labels), 
            this.createLabels(this.state.data.suicides.labels), 
            this.createLabels(this.state.data.teammateKills.labels), 
            this.createLabels(this.state.data.efficiency.labels), 
        ];

        const labelsPrefix = [
            "Kills at ",
            "Deaths at ",
            "Suicides at ",
            "Teammate Kills at ",
            "Efficiency at ",
        ]

        const graphData = [
            this.state.data.kills.data, 
            this.state.data.deaths.data, 
            this.state.data.suicides.data, 
            this.state.data.teammateKills.data, 
            this.state.data.efficiency.data
        ];


        if(this.props.teams > 1){

            tabs.push({"name": "Team Kills", "title": "Team Total Kills"},
            {"name": "Team Deaths", "title": "Team Total Deaths"},
            {"name": "Team Suicides", "title": "Team Total Suicides"},
            {"name": "Teammate Kills", "title": "Total Teammate Kills"},
            {"name": "Team Efficiency", "title": "Team Efficiency"});

            const teamsData = [
                this.state.data.teamKills.data, 
                this.state.data.teamDeaths.data, 
                this.state.data.teamSuicides.data, 
                this.state.data.teamsTeammateKills.data,
                this.state.data.teamEfficiency.data
            ];

            const teamsLabels = [
                this.createLabels(this.state.data.teamKills.labels),
                this.createLabels(this.state.data.teamDeaths.labels),
                this.createLabels(this.state.data.teamSuicides.labels),
                this.createLabels(this.state.data.teamsTeammateKills.labels),
                this.createLabels(this.state.data.teamEfficiency.labels),
            ];

            labelsPrefix.push("Team Total Kills ");
            labelsPrefix.push("Team Total Deaths ");
            labelsPrefix.push("Team Total Suicides ");
            labelsPrefix.push("Team Total TeamKills ");
            labelsPrefix.push("Team Total Efficiency ");

            graphData.push(...teamsData);
            labels.push(...teamsLabels);
        }

        const testData = {
            "data": graphData,
            "labels": labels,
            "labelsPrefix": labelsPrefix
        };


        return <div>
            <div className="default-header">Frags Graph</div>
            <CustomGraph data={testData.data} tabs={tabs} labels={testData.labels} labelsPrefix={testData.labelsPrefix}/>     
        </div>
    }
}

export default MatchFragsGraph;