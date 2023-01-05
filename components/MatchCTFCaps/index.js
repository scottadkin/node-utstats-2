import React from 'react';
import Functions from '../../api/functions';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import InteractiveTable from '../InteractiveTable';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';


class MatchCTFCaps extends React.Component{

    constructor(props){

        super(props);

        this.state = {"bLoading": true, "error": null, "data": null};
    }


    async loadData(){

        console.log(`loadData`);

        this.setState({"bLoading": true});

        const req = await fetch("/api/ctf",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "match-caps", "matchId": this.props.matchId})
        });

        const res = await req.json();

        if(res.error !== undefined){
            this.setState({"error": res.error, "bLoading": false});
        }else{
            this.setState({"data": res.data, "bLoading": false});
        }

        console.log(res);
    }

    async componentDidMount(){

        await this.loadData();
    }

    async componentDidUpdate(prevProps){
        
        const prevPlayers = JSON.stringify(prevProps.playerData);
        const currentPlayers = JSON.stringify(this.props.playerData);
        if(prevProps.matchId !== this.props.matchId || prevPlayers !== currentPlayers){
            await this.loadData();
        }
    }

    renderData(){

        const data = [];
        const headers = {
            "match_score": "Match Score",
            "grab_time": "Grabbed",
            "grabbed_by": "Grabbed By",
            "cap_time": "Capped",
            "capped_by": "Capped By",
            "travel_time": "Travel Time",
            "drop_time": "Dropped Time",
            "total_drops": "Times Dropped",
            "total_covers": "Covers",
            "total_self_covers": "Self Covers",
            "total_seals": "Seals",
            "total_assists": "Assists",
        };

        let teamScores = [];

        for(let i = 0; i < this.props.totalTeams; i++){
            teamScores.push(0);
        }

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            teamScores[d.cap_team]++;

            let teamScoreString = "";

            for(let x = 0; x < teamScores.length; x++){

                teamScoreString += `${teamScores[x]}`;

                if(x < teamScores.length - 1){
                    teamScoreString += ` - `
                }
            }

            const grabPlayer = Functions.getPlayer(this.props.playerData, d.grab_player);
            const capPlayer = Functions.getPlayer(this.props.playerData, d.cap_player);

            data.push({
                "match_score": {
                    "value": d.cap_time, 
                    "displayValue": teamScoreString, 
                    "className": Functions.getTeamColor(d.cap_team)
                },
                "cap_time": {
                    "value": d.cap_time, 
                    "displayValue": Functions.MMSS(d.cap_time - this.props.matchStart), 
                    "className": "playtime"
                },
                "grab_time": {
                    "value": d.grab_time, 
                    "displayValue": Functions.MMSS(d.grab_time - this.props.matchStart), 
                    "className": "playtime"
                },
                "grabbed_by": {
                    "value": grabPlayer.name.toLowerCase(),
                    "displayValue": <Link href={`/pmatch/${this.props.matchId}?player=${d.grab_player}`}>
                        <a><CountryFlag country={grabPlayer.country}/>{grabPlayer.name}</a>
                    </Link>
                },
                "capped_by": {
                    "value": capPlayer.name.toLowerCase(),
                    "displayValue": <Link href={`/pmatch/${this.props.matchId}?player=${d.cap_player}`}>
                        <a><CountryFlag country={capPlayer.country}/>{capPlayer.name}</a>
                    </Link>
                },
                "travel_time": {
                    "value": d.travel_time,
                    "displayValue": Functions.toPlaytime(d.travel_time),
                    "className": "playtime"
                },
                "drop_time": {
                    "value": d.drop_time,
                    "displayValue": Functions.toPlaytime(d.drop_time),
                    "className": "playtime"
                },
                "total_drops": {
                    "value": d.total_drops,
                    "displayValue": Functions.ignore0(d.total_drops),
                },
                "total_covers": {
                    "value": d.total_covers,
                    "displayValue": Functions.ignore0(d.total_covers),
                },
                "total_self_covers": {
                    "value": d.total_self_covers,
                    "displayValue": Functions.ignore0(d.total_self_covers),
                },
                "total_seals": {
                    "value": d.total_seals,
                    "displayValue": Functions.ignore0(d.total_seals),
                },
                "total_assists": {
                    "value": d.total_assists,
                    "displayValue": Functions.ignore0(d.total_assists),
                }
            });

        }
        


        return <InteractiveTable width={1} headers={headers} data={data}/>
    }

    render(){

        if(this.state.error !== null){
            return <ErrorMessage title="Match CTF Caps" text={this.state.error}/>
        }

        if(this.state.bLoading){
            return <Loading />;
        }

        return <div className="m-bottom-25">
            <div className="default-header">Capture The Flag Caps</div> 
            {this.renderData()}
        </div>;

    }
}

export default MatchCTFCaps;