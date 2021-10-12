import React from 'react';
import Graph from '../Graph';


class MatchPlayerPingHistory extends React.Component{

    constructor(props){

        super(props);
        this.state = {"finishedLoading": false, "data": []};
    }

    async loadData(){

        try{

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "pings", "matchId": this.props.matchId, "players": this.props.players})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"finishedLoading": true, "data": res.data});
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

    render(){


        if(!this.state.finishedLoading) return null;

        return <div>
            <div className="default-header">Player Ping History</div>
            <Graph title="Player Ping History" data={JSON.stringify(this.state.data)}/>
        </div>
    }
}

export default MatchPlayerPingHistory;