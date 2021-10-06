import React from 'react';
import styles from './MatchCTFCapsNew.module.css';
import Functions from '../../api/functions';
import MatchCTFCap from '../MatchCTFCap';

class MatchCTFCapsNew extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": [], "finishedLoading": false};

    }

    async loadData(){

        try{

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "ctfcaps", "matchId": this.props.matchId})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"data": res.data, "finishedLoading": true});

            }else{
                throw new Error(res.error);
            }


        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadData();
    }



    createCoverData(covers, players){

        covers = covers.split(",");
        const data = {};

        for(let i = 0; i < covers.length; i++){

            const c = parseInt(covers[i]);

            if(c !== c) continue;

            if(data[c] === undefined){
                data[c] = 0;
            }

            data[c]++;

        }

        const returnData = [];

        for(const [key, value] of Object.entries(data)){
            returnData.push({"player": Functions.getPlayer(players, parseInt(key)), "covers": value});
        }

        if(returnData.length > 0){

            returnData.sort((a, b) =>{

                a = a.covers;
                b = b.covers;

                if(a < b) return 1;
                if(a > b) return -1;
                return 0;
            });
        }

        return returnData;

    }

    createAssistData(assists, players){

        assists = assists.split(",");

        const uniquePlayers = [];

        for(let i = 0; i < assists.length; i++){

            const c = parseInt(assists[i]);

            if(c !== c) continue;

            if(uniquePlayers.indexOf(c) === -1){
                uniquePlayers.push(c);
            }

        }

        const returnData = [];

        for(let i = 0; i < uniquePlayers.length; i++){
            returnData.push(Functions.getPlayer(players, uniquePlayers[i]));
        }

        return returnData;

    }

    render(){

        if(!this.state.finishedLoading) return null;

        const elems = [];
        const players = this.props.players;

        const matchStart = this.props.start;

        const teamScores = [0,0,0,0];

        for(let i = 0; i < this.state.data.length; i++){


            const d = this.state.data[i];

            teamScores[d.team]++;

            const redScore = teamScores[0];
            const blueScore = teamScores[1];
            const greenScore = teamScores[2];
            const yellowScore = teamScores[3];

            const grabPlayer = Functions.getPlayer(players, d.grab);
            const capPlayer = Functions.getPlayer(players, d.cap);

            const coverPlayers = this.createCoverData(d.covers, players);
            const assistPlayers = this.createAssistData(d.assists, players);
        
            let totalCarryTime = 0;

            const assistTimes = d.assist_carry_times.split(",");

            for(let x = 0; x < assistTimes.length; x++){

                if(assistTimes[x] !== ""){

                    totalCarryTime += parseFloat(assistTimes[x]);
     
                }
            }

            elems.push(<MatchCTFCap 
                key={i} 
                team={d.team}
                grabPlayer={grabPlayer} 
                grabTime={d.grab_time - matchStart}
                capPlayer={capPlayer}
                capTime={d.cap_time - matchStart}
                coverPlayers={coverPlayers}
                travelTime={d.travel_time}
                dropTime={d.travel_time - totalCarryTime}
                assistPlayers={assistPlayers}
                totalTeams={this.props.totalTeams}
                teamScores={[redScore, blueScore, greenScore, yellowScore]}
                
            />);
            
        }

        return <div>
            <div className="default-header">Capture The Flag Caps</div>
    
            {elems}
               
        </div>

       /* return <div>
            <div className="default-header">Capture The Flag Caps</div>
            <table className={`t-width-1 ${styles.table}`}>
                <tbody>
                    <tr className="text-center">
                        <th>Grabbed</th>
                        <th>Covers</th>
                        <th>Assists</th>
                        <th>Capped</th>
                        <th>Travel Time</th>
                        <th>Time Dropped</th>
                    </tr>
                    {elems}
                </tbody>
            </table>
        </div>*/
    }
}

export default MatchCTFCapsNew;