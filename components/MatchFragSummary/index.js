import {React, useState} from 'react';
import MatchFragTable from '../MatchFragTable/';
import MatchFragDistances from '../MatchFragDistances/';

const MatchFragSummary = ({matchId, playerData, totalTeams, single}) =>{

    const [mode, setMode] = useState(0);
    const [separateByTeam, setSeparateByTeam] = useState(true);

    const bAnyDistanceData = () =>{

        const types = [
            "shortest_kill_distance", 
            "average_kill_distance", 
            "longest_kill_distance",
            "k_distance_normal",
            "k_distance_long",
            "k_distance_uber"
        ];

        for(let i = 0; i < playerData.length; i++){

            const p = playerData[i];

            for(let x = 0; x < types.length; x++){

                if(p[types[x]] !== 0){
                    return true;
                }
            }
        }

        return false;
    }

    const renderTabs = () =>{

        if(!bAnyDistanceData()) return null;

        return <div className="tabs">
            <div onClick={() => setMode(0)} className={`tab ${(mode === 0) ? "tab-selected" : "" }`}>General Data</div>
            <div onClick={() => setMode(1)} className={`tab ${(mode === 1) ? "tab-selected" : "" }`}>Kill Distances</div>
        </div>         
    }

    const renderDefaultTable = () =>{

        if(mode !== 0) return null;

        return <MatchFragTable 
            playerData={playerData} 
            totalTeams={totalTeams} 
            bSeparateByTeam={separateByTeam} 
            highlight={null}
            matchId={matchId}
        />
    }

    const renderDistanceTable = () =>{

        if(mode !== 1) return null;

        return <MatchFragDistances 
            playerData={playerData} 
            totalTeams={totalTeams} 
            bSeparateByTeam={separateByTeam} 
            highlight={null}
            matchId={matchId}
        />
    }

    return <div>
        <div className="default-header">Frags Summary</div>
        {renderTabs()}
        <div className="tabs">
            <div onClick={() => setSeparateByTeam(true)} className={`tab ${(separateByTeam) ? "tab-selected" : ""}`}>Separate by Team</div>
            <div onClick={() => setSeparateByTeam(false)} className={`tab ${(!separateByTeam) ? "tab-selected" : ""}`}>Display All</div>
        </div>
        {renderDefaultTable()}
        {renderDistanceTable()}
    </div>
}

export default MatchFragSummary;

/*

class MatchFragSummary extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0}; //0 normal, 1 kill distances

        this.changeMode = this.changeMode.bind(this);

    }

    changeMode(id){

        this.setState({"mode": id});
    }

    displaySelected(id){

        if(id === this.state.mode) return "tab-selected"
        return '';
    }

    getPlayersInTeam = (team) =>{

        const foundPlayers = [];
   
        let p = 0;
    
        for(let i = 0; i < this.props.playerData.length; i++){

            p = this.props.playerData[i];
            
            if(p.team === team || team === -1){
                foundPlayers.push(p);
            }
        }
    
        return foundPlayers;
    }

    typesToDisplay(){

        const toDisplay = [];
        const toDisplayDistances = [];

        const typesTeams = {
            "suicides": [],
            "team_kills": [],
            "spawn_kills": [],
            "headshots":  [],
            "deaths":  [],
            "kills": [],
            "frags":  [],
            "score":  [],
            "k_distance_normal": [],
            "k_distance_long": [],
            "k_distance_uber": []
        };


        const types = [
            "suicides",
            "team_kills",
            "spawn_kills",
            "headshots",
            "deaths",
            "kills",
            "frags",
            "score",
            "k_distance_normal",
            "k_distance_long",
            "k_distance_uber"
        ];


        let p = 0;

        for(let i = 0; i < this.props.playerData.length; i++){

            p = this.props.playerData[i];

            for(let x = 0; x < types.length; x++){

                if(p[types[x]] !== 0){

                    if(this.props.totalTeams !== 0){
                        if(typesTeams[types[x]].indexOf(p.team) === -1) typesTeams[types[x]].push(p.team);
                    }else{
                        if(typesTeams[types[x]].indexOf(0) === -1) typesTeams[types[x]].push(0);
                    }
                }
            }
        }

        
        let i = 0;

        for(const [key, value] of Object.entries(typesTeams)){

            if(value.length > 0){

                if(i < 7){
                    toDisplay.push(key);
                }else{
                    toDisplayDistances.push(key);
                }
                
            }
            i++;
        }


        return {"default": toDisplay, "distances": toDisplayDistances};
    }


    render(){

        let elems = [];

        const single = (this.props.single !== undefined) ? true : false;

        const teamData = [];

        const toDisplay = this.typesToDisplay();

        if(this.state.mode === 0){

            if(this.props.totalTeams < 2){
                teamData.push(<MatchFragTable key={-1} host={this.props.host} single={single} players={this.getPlayersInTeam(-1)} toDisplay={toDisplay.default} 
                    team={-1} matchStart={this.props.matchStart}
                    matchId={this.props.matchId}
                />);
            }else{

                for(let i = 0; i < this.props.totalTeams; i++){
                   // teamData.push(this.getPlayersInTeam(i));
                    teamData.push(<MatchFragTable key={i} host={this.props.host} single={single} players={this.getPlayersInTeam(i)} toDisplay={toDisplay.default}
                     team={i} matchStart={this.props.matchStart}
                        matchId={this.props.matchId}
                    />);
                }
            }

        }else if(this.state.mode === 1){

            if(this.props.totalTeams < 2){
        
                teamData.push(<MatchFragDistances key={-1} host={this.props.host}
                    single={single} toDisplay={toDisplay.distances} players={this.getPlayersInTeam(-1)} team={-1}
                    matchId={this.props.matchId}
                 />);

            }else{

                for(let i = 0; i < this.props.totalTeams; i++){

                    teamData.push(<MatchFragDistances key={i} host={this.props.host}
                     single={single} toDisplay={toDisplay.distances} players={this.getPlayersInTeam(i)} team={i}
                        matchId={this.props.matchId}  
                    />);
                }
            }
        }

        return <div>
            <div className="default-header">Frag Summary</div>

            {teamData}
        </div>
    }
}


export default MatchFragSummary;*/