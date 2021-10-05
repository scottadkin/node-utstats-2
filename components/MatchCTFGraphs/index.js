import React from 'react';


class MatchCTFGraphs extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": []};
    }

    async loadData(){

        try{

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "ctfevents", "matchId": this.props.matchId})
            });

            const res = await req.json();

            console.log(res);
            
        }catch(err){
            console.trace(err);
        }   
    }

    async componentDidMount(){

        await this.loadData();
    }

    render(){

        return <div>
            <div className="default-header">Capture The Flag Graphs</div>
        </div>
    }
}

export default MatchCTFGraphs;