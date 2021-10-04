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




    convertKillData(data){

        const kills = [];
        const deaths = [];
        const suicides = [];
        const indexes = [];

        const teamsKills = [];
        const teamsDeaths = [];
        const teamsSuicides = [];


        for(const [key] of Object.entries(this.props.players)){

            indexes.push(parseInt(key));
            kills.push([0]);
            deaths.push([0]);
            suicides.push([0]);
        }

        for(let i = 0; i < this.props.teams; i++){

            teamsKills.push([0]);
            teamsDeaths.push([0]);
            teamsSuicides.push([0]);
        }

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const killerIndex = indexes.indexOf(d.killer);
            let victimIndex = indexes.indexOf(d.victim);

            const killerTeam = d.killer_team;
            const victimTeam = d.victim_team;

            if(victimIndex !== -1){
                const previousKills = kills[killerIndex];
                previousKills.push(previousKills[previousKills.length - 1] + 1);
            }

            if(victimIndex === -1){

                victimIndex = killerIndex;
                const previousSuicides = suicides[killerIndex];
                previousSuicides.push(previousSuicides[previousSuicides.length - 1] + 1);

                for(let x = 0; x < indexes.length; x++){

                    if(x !== killerIndex){
                        suicides[x].push(suicides[x][suicides[x].length - 1]);
                    }
                }

            }

            const previousDeaths = deaths[victimIndex];
            previousDeaths.push(previousDeaths[previousDeaths.length - 1] + 1);
           

            for(let x = 0; x < indexes.length; x++){

                if(x !== killerIndex){
                    kills[x].push(kills[x][kills[x].length - 1]);
                }

                if(x !== victimIndex){
                    deaths[x].push(deaths[x][deaths[x].length - 1]);
                }
            }

            if(this.props.teams > 1){
                if(victimTeam !== -1){

                    teamsKills[killerTeam].push(teamsKills[killerTeam][teamsKills[killerTeam].length - 1] + 1);
                    teamsDeaths[killerTeam].push(teamsDeaths[killerTeam][teamsDeaths[killerTeam].length - 1]);

                }else{

                    teamsSuicides[killerTeam].push(teamsSuicides[killerTeam][teamsSuicides[killerTeam].length - 1] + 1);

                    for(let x = 0; x < this.props.teams; x++){

                        if(x !== killerTeam){
                            teamsSuicides[x].push(teamsSuicides[x][teamsSuicides[x].length - 1]);
                        }
                    }
                }

                for(let x = 0; x < teamsKills.length; x++){

                    if(x !== killerTeam || victimTeam === -1){
                        teamsKills[x].push(teamsKills[x][teamsKills[x].length - 1]);
                        
                    }

                    if(victimTeam !== -1 && x !== killerTeam){
                        teamsDeaths[x].push(teamsDeaths[x][teamsDeaths[x].length - 1] + 1);
                    } 
                }
            }
        }


        const killsData = [];
        const deathsData = [];
        const suicidesData = [];

        for(let i = 0; i < indexes.length; i++){

            const currentName = (this.props.players[indexes[i]] !== undefined) ? this.props.players[indexes[i]] : "Not Found";

            const currentKills = {"data": kills[i], "name": currentName, "lastValue": kills[i][kills[i].length - 1]};
            const currentDeaths = {"data": deaths[i], "name": currentName, "lastValue": deaths[i][deaths[i].length - 1]};
            const currentSuicides = {"data": suicides[i], "name": currentName, "lastValue": suicides[i][suicides[i].length - 1]};

            killsData.push(currentKills);
            deathsData.push(currentDeaths);
            suicidesData.push(currentSuicides);
        }



        const teamsKillsData = [];
        const teamsDeathsData = [];
        const teamsSuicideData = [];

        if(this.props.teams > 1){

            for(let i = 0; i < this.props.teams; i++){

                const currentName = Functions.getTeamName(i);

                const currentKills =  {"data": teamsKills[i], "name": currentName, "lastValue": teamsKills[i][teamsKills[i].length - 1]};
                const currentDeaths =  {"data": teamsDeaths[i], "name": currentName, "lastValue": teamsDeaths[i][teamsDeaths[i].length - 1]};
                const currentSuicides =  {"data": teamsSuicides[i], "name": currentName, "lastValue": teamsSuicides[i][teamsSuicides[i].length - 1]};

                teamsKillsData.push(currentKills);
                teamsDeathsData.push(currentDeaths);
                teamsSuicideData.push(currentSuicides);
            }
        }

        const byLastValue = (a, b) =>{

            a = a.lastValue;
            b = b.lastValue;
            
            if(a < b){
                return 1;
            }else if(a > b){
                return -1;
            }

            return 0;
        }

        killsData.sort(byLastValue);
        deathsData.sort(byLastValue);
        suicidesData.sort(byLastValue);
        
        this.setState({
            "kills": killsData, 
            "deaths": deathsData, 
            "suicides": suicidesData, 
            "teamsKills": teamsKillsData, 
            "teamsDeaths": teamsDeathsData,
            "teamsSuicides": teamsSuicideData
        });
        
    }

    async loadKills(){

        try{

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "kills", "matchId": this.props.matchId})
            });

            const res = await req.json();

            if(res.error === undefined){
                this.convertKillData(res.data);
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
        const graphData = [this.state.kills, this.state.deaths, this.state.suicides];


        const teamsTitles = ["Team Total Kills", "Team Total Deaths", "Team Total Suicides"];
        const teamsData = [this.state.teamsKills, this.state.teamsDeaths, this.state.teamsSuicides];

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