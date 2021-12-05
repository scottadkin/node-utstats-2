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

    createEvents(type, times, playerIds, capEvents, players){

        //console.log(arguments);
        console.log("########################################################################");

        const pIds = playerIds.split(",");
        const timestamps = times.split(",");

        console.log(timestamps);
        //console.log(players);

        for(let i = 0; i < timestamps.length; i++){

            const t = parseFloat(timestamps[i]);
            const p = parseInt(pIds[i]);

            if(t !== t || p !== p) continue;

           //console.log(t);

            capEvents.push({
                "type": type,
                "timestamp": t,
                "player": Functions.getPlayer(players, p)
            });
        }

    }

    render(){

        if(!this.state.finishedLoading) return null;

        if(this.state.data.length === 0) return null;

        const elems = [];
        const players = this.props.players;

        const matchStart = this.props.start;

        const teamScores = [0,0,0,0];

        console.log(this.state.data);

        for(let i = 0; i < this.state.data.length; i++){


            const d = this.state.data[i];
            

            //console.log(i);
            //console.log(d);

            teamScores[d.team]++;

            const redScore = teamScores[0];
            const blueScore = teamScores[1];
            const greenScore = teamScores[2];
            const yellowScore = teamScores[3];

            if(i !== this.state.page) continue;
            if(i > this.state.page) return;

            const capEvents = [];

            const grabPlayer = Functions.getPlayer(players, d.grab);

            capEvents.push(
                {
                    "type": "grab",
                    "timestamp": d.grab_time,
                    "player": grabPlayer
                }
            );


            const capPlayer = Functions.getPlayer(players, d.cap);

            capEvents.push(
                {
                    "type": "cap",
                    "timestamp": d.cap_time,
                    "player": capPlayer
                }
            );

            this.createEvents("drop", d.drop_times, d.drops, capEvents, players);
            this.createEvents("pickup", d.pickup_times, d.pickups, capEvents, players);
            this.createEvents("cover", d.cover_times, d.covers, capEvents, players);
            this.createEvents("self_cover", d.self_covers_times, d.self_covers, capEvents, players);


            capEvents.sort((a, b) =>{

                a = a.timestamp;
                b = b.timestamp;

                if(a < b){
                    return -1;
                }else if(a > b){
                    return 1;
                }

                return 0;
            });

            console.table(capEvents);


           // console.log(grabPlayer);

            /*const grabPlayer = Functions.getPlayer(players, d.grab);
            const capPlayer = Functions.getPlayer(players, d.cap);

            const coverPlayers = this.createCoverData(d.covers, players);*/
            const assistPlayers = this.createAssistData(d.assist_carry_ids, d.assist_carry_times, players);

           // const selfCoverPlayers = this.createSelfCoversData(d.self_covers, d.self_covers_times, players);
            let totalCarryTime = 0;

            const assistTimes = d.assist_carry_times.split(",");

            for(let x = 0; x < assistTimes.length; x++){

                if(assistTimes[x] !== ""){

                    totalCarryTime += parseFloat(assistTimes[x]);
     
                }
            }

            elems.push(<MatchCTFCap 
                host={this.props.host}
                key={i} 
                matchId={this.props.matchId}
                team={d.team}
                totalTeams={this.props.totalTeams}
                teamScores={[redScore, blueScore, greenScore, yellowScore]}
                events={capEvents}
                carryTime={totalCarryTime}
                
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