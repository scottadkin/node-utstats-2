import React from "react";
import ErrorMessage from "../ErrorMessage";
import Loading from "../Loading";

class CombogibPlayerMatch extends React.Component{

    constructor(props){

        super(props);

        this.state = {"error": null, "bLoading": true};
    }

    async loadData(){

        const req = await fetch("/api/combogib", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "pmatch", "matchId": this.props.matchId, "playerId": this.props.playerId})
        });

        const res = await req.json();

        if(res.error !== undefined){
            this.setState({"error": res.error});
        }

        console.log(res);

        this.setState({"bLoading": false});

    }

    async componentDidMount(){

        await this.loadData();
    }

    render(){

        if(this.state.error !== null) return <ErrorMessage title="Combogib Stats" text={this.state.error}/>;
        if(this.state.bLoading) return <Loading />;

        return <div>
            <div className="default-header">Combogib Stats</div>
            
        </div>
    }
}

export default CombogibPlayerMatch;