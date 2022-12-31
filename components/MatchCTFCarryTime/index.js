import React from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import InteractiveTable from "../InteractiveTable";
import Link from "next/link";
import CountryFlag from "../CountryFlag";
import Functions from "../../api/functions";

class MatchCTFCarryTime extends React.Component{

    constructor(props){

        super(props);
        this.state = {"bLoading": true, "error": null, "data": []};
    }

    async loadData(){

        const req = await fetch("/api/ctf", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "carrytime", "matchId": this.props.matchId})
        });

        const res = await req.json();

        if(res.error !== undefined){
            this.setState({"error": res.error, "bLoading": false});
        }else{
            this.setState({"data": res.data, "bLoading": false});
        }
    }

    async componentDidMount(){

        await this.loadData();
    }


    renderData(){

        const headers = {
            "name": "Player",
            "flag_assist": "Flag Assist",
            "flag_capture": "Flag Caps",
            "flag_carry_time_best": "Best Carry Time Single Life",
            "flag_carry_time": "Total Flag Carry Time",
        };

        const data = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            const player = Functions.getPlayer(this.props.players, d.player_id);

            const playerElem = <Link href={`/pmatch/${this.props.matchId}?player=${d.player_id}`}>
                <a><CountryFlag country={player.country}/>{player.name}</a>
            </Link>;

            
            data.push({
                "name": {
                    "value": player.name.toLowerCase(), 
                    "displayValue": playerElem, 
                    "className": `text-left ${Functions.getTeamColor(player.team)}`
                },
                "flag_assist": {
                    "value": d.flag_assist, 
                    "displayValue": Functions.ignore0(d.flag_assist)
                },
                "flag_capture": {
                    "value": d.flag_capture, 
                    "displayValue": Functions.ignore0(d.flag_capture)
                },
                "flag_carry_time_best": {
                    "value": d.flag_carry_time_best, 
                    "displayValue": Functions.toPlaytime(d.flag_carry_time_best),
                    "className": "playtime"
                },
                "flag_carry_time": {
                    "value": d.flag_carry_time, 
                    "displayValue":  Functions.toPlaytime(d.flag_carry_time),
                    "className": "playtime"
                },
            });
        }


        return <InteractiveTable width={1} headers={headers} data={data}/>
    }

    render(){

        if(this.state.bLoading) return <Loading />;

        if(this.state.error !== null){

            return <ErrorMessage title="Capture The Flag Carry Times" text={this.state.error}/>
        }

        return <div>
            <div className="default-header">
                Capture The Flag Carry Times
            </div>
            {this.renderData()}
        </div>
    }
}

export default MatchCTFCarryTime;