import React from 'react';
import styles from './MatchCTFCapsNew.module.css';
import Functions from '../../api/functions';
import MatchCTFCap from '../MatchCTFCap';
import BasicPageSelect from '../BasicPageSelect';

class MatchCTFCapsNew extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": [], "finishedLoading": false, "page": 0, "perPage": 1};

        this.changePage = this.changePage.bind(this);
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


    changePage(page){

        if(page < 0) page = 0;
        if(page > this.state.data.length - 1) page = this.state.data.length - 1;

        this.setState({"page": page});
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

    createAssistData(assists, assistTimes, players){

        assists = assists.split(",");
        assistTimes = assistTimes.split(",");

        const returnData = [];

        for(let i = 0; i < assists.length; i++){
            returnData.push({"player": Functions.getPlayer(players, parseInt(assists[i])), "carryTime": assistTimes[i]});
        }

        return returnData;

    }


    createSelfCoversData(playerIds, coversCount, players){

        playerIds = playerIds.split(",");
        coversCount = coversCount.split(",");

        const playerIndexes = [];

        const returnData = [];

        for(let i = 0; i < playerIds.length; i++){

            const p = parseInt(playerIds[i]);

            if(p !== p) continue;

            const covers = parseInt(coversCount[i]);

            const currentPlayer = Functions.getPlayer(players, p);

            let currentIndex = playerIndexes.indexOf(p);

            if(currentIndex === -1){

                playerIndexes.push(p);
                returnData.push({"player": currentPlayer, "kills": 0});

                currentIndex = playerIndexes.indexOf(p);
            }

            returnData[currentIndex].kills += covers;
        }

        return returnData;
    }

    render(){

        if(!this.state.finishedLoading) return null;

        if(this.state.data.length === 0) return null;

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

            if(i !== this.state.page) continue;
            if(i > this.state.page) return;

            const grabPlayer = Functions.getPlayer(players, d.grab);
            const capPlayer = Functions.getPlayer(players, d.cap);

            const coverPlayers = this.createCoverData(d.covers, players);
            const assistPlayers = this.createAssistData(d.assist_carry_ids, d.assist_carry_times, players);

            const selfCoverPlayers = this.createSelfCoversData(d.self_covers, d.self_covers_count, players);
            let totalCarryTime = 0;

            const assistTimes = d.assist_carry_times.split(",");

            for(let x = 0; x < assistTimes.length; x++){

                if(assistTimes[x] !== ""){

                    totalCarryTime += parseFloat(assistTimes[x]);
     
                }
            }

            elems.push(<MatchCTFCap 
                key={i} 
                matchId={this.props.matchId}
                team={d.team}
                grabPlayer={grabPlayer} 
                grabTime={d.grab_time - matchStart}
                capPlayer={capPlayer}
                capTime={d.cap_time - matchStart}
                coverPlayers={coverPlayers}
                travelTime={d.travel_time}
                dropTime={d.travel_time - totalCarryTime}
                carryTime={totalCarryTime}
                assistPlayers={assistPlayers}
                totalTeams={this.props.totalTeams}
                teamScores={[redScore, blueScore, greenScore, yellowScore]}
                selfCovers={selfCoverPlayers}
                
            />);
            
        }

        return <div>
            <div className="default-header">Capture The Flag Caps</div>
            <BasicPageSelect results={this.state.data.length} perPage={this.state.perPage} page={this.state.page} changePage={this.changePage}/>
            {elems}
               
        </div>;
    }
}

export default MatchCTFCapsNew;