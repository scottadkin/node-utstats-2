import React from "react";
import Loading from "../Loading";
import ErrorMessage from "../ErrorMessage";
import styles from"./MatchKillsMatchUp.module.css";
import Functions from "../../api/functions";
import CountryFlag from "../CountryFlag";

class MatchKillsMatchUp extends React.Component{

    constructor(props){

        super(props);

        this.state = {"bLoaded": false, "error": null, "data": null};
    }


    async componentDidMount(){

        await this.loadData();
    }


    async loadData(){


        const req = await fetch("/api/match", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "kmu", "matchId": this.props.matchId})
        });

        const res = await req.json();

        if(res.error === undefined){
            this.setState({"data": res.data, "bLoaded": true});
        }else{
            this.setState({"error": res.error, "bLoaded": true});
        }

    }

    getHeaders(){

        const headers = [];

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            if(p.spectator || !p.played) continue;

            headers.push(<th key={p.id} className={`${styles.th} ${Functions.getTeamColor(p.team)} text-left`}>
                <img className={styles.flag} src={`/images/flags/${p.country}.svg`} alt="flag"/>&nbsp;{p.name}
            </th>);
        }


        return headers;
    }

    getKills(killer, victim){

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            if(d.killer === killer && d.victim === victim){
                return d.kills;
            }
        }

        return 0;
    }

    createKillColumns(playerId){

        const cols = [];

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            if(p.spectator || !p.played) continue;

            if(p.id === playerId){
                cols.push(<td key={`pid-${p.id}`} className={"color3"}>{Functions.ignore0(this.getKills(playerId, playerId))}</td>);
            }else{
                cols.push(<td key={`pid-${p.id}`}>{Functions.ignore0(this.getKills(playerId, p.id))}</td>);
            }

        }

        return cols;
    }

    renderTable(){

        if(!this.state.bLoaded) return null;

        const headers = this.getHeaders();

        const rows = [];
        

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            if(p.spectator || !p.played) continue;

            rows.push(<tr key={p.id}>
                <td className={`${Functions.getTeamColor(p.team)} text-left`}><CountryFlag country={p.country}/>{p.name}</td>
                {this.createKillColumns(p.id)}
            </tr>);
        }

        return <table>
            <tbody>
                <tr>
                    <th>&nbsp;</th>
                    {headers}
                </tr>
                {rows}
            </tbody>
        </table>
    }
    

    render(){


        if(this.state.error !== null){
            return <ErrorMessage title="Match Kills Match Up" text={this.state.error}/>
        }

        return <div>
            <div className="default-header">Kills Match Up</div>
            <Loading value={this.state.bLoaded}/>
            {this.renderTable()}
        </div>
    }
}

export default MatchKillsMatchUp;