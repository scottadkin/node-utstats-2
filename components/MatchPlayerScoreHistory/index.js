import React from 'react';
import Graph from '../Graph';

class MatchPlayerScoreHistory extends React.Component{

    constructor(props){

        super(props);

        this.state = {"data": [], "finishedLoading": false};
    }

    async loadData(){

        try{

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "scorehistory", "matchId": this.props.matchId, "players": this.props.players})
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

    render(){

        if(!this.state.finishedLoading) return null;

        return <div>
            <div className="default-header">Player Score History</div>
            <Graph title="Score History" data={JSON.stringify(this.state.data)}/>
        </div>
    }
}

export default MatchPlayerScoreHistory;