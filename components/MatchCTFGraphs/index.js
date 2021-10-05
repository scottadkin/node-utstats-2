import React from 'react';
import Graph from '../Graph';


class MatchCTFGraphs extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": [], "finishedLoading": false};
    }

    async loadData(){

        try{

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "ctfevents", "matchId": this.props.matchId, "teams": this.props.totalTeams, "players": this.props.players})
            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"finishedLoading": true, "data": res.data});
            }
            console.log(res);
            
        }catch(err){
            console.trace(err);
        }   
    }

    async componentDidMount(){

        await this.loadData();
    }

    render(){

        if(!this.state.finishedLoading) return null;

        const titles = [
            "Flag Caps",
            "Flag Assists",
            "Flag Grabs",
            "Flag Pickups",
            "Flag Covers",
            "Flag Seals",
            "Flag Kills",
            "Flag Returns",
            "Flag Close Saves",
            "Flag Drops",
            "Team Flag Caps",
            "Team Flag Assists",
            "Team Flag Grabs",
            "Team Flag Pickups",
            "Team Flag Covers",
            "Team Flag Seals",
            "Team Flag Kills",
            "Team Flag Returns",
            "Team Flag Close Saves",
            "Team Flag Drops"
        ];

        const data = [
            this.state.data.caps,
            this.state.data.assists,
            this.state.data.grabs,
            this.state.data.pickups,
            this.state.data.covers,
            this.state.data.seals,
            this.state.data.kills,
            this.state.data.returns,
            this.state.data.saves,
            this.state.data.drops,
            this.state.data.teamCaps,
            this.state.data.teamAssists,
            this.state.data.teamGrabs,
            this.state.data.teamPickups,
            this.state.data.teamCovers,
            this.state.data.teamSeals,
            this.state.data.teamKills,
            this.state.data.teamReturns,
            this.state.data.teamSaves,
            this.state.data.teamDrops
        ];

        return <div>
            <div className="default-header">Capture The Flag Graphs</div>
            <Graph title={titles} data={JSON.stringify(data)}/>
        </div>
    }
}

export default MatchCTFGraphs;