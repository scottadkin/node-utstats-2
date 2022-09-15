import React from "react";
import Image from "next/image";
import Table2 from "../Table2";
import CountryFlag from "../CountryFlag";
import ErrorMessage from "../ErrorMessage";
import Functions from "../../api/functions";
import Link from "next/link";

class CombogibMatchStats extends React.Component{

    constructor(props){

        super(props);

        this.state = {"data": null, "error": null, "mode": 0, "sortType": "name", "bAscendingOrder": true};

        this.sortGeneral = this.sortGeneral.bind(this);
        
    }

    sortGeneral(type){

        let sortType = type.toLowerCase();

        if(sortType === this.state.sortType){

            this.setState({"bAscendingOrder": !this.state.bAscendingOrder});
            return;
        }

        this.setState({"sortType": sortType, "bAscendingOrder": true});
    }

    async loadData(){

        const req = await fetch("/api/combogib",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "match", "matchId": this.props.matchId})
        });

        const res = await req.json();

        if(res.error === undefined){

            this.setState({"data": res.data});
        }else{
            this.setState({"error": res.error});
        }

        this.setState({"bLoaded": true});

    }

    async componentDidMount(){

        await this.loadData();
    }


    renderBasic(){

        const rows = [];

        const data = JSON.parse(JSON.stringify(this.state.data));

        data.sort((a, b) =>{

            if(this.state.sortType === "combos"){
                a = a.combo_kills;
                b = b.combo_kills;
            }

            if(this.state.sortType === "balls"){
                a = a.ball_kills;
                b = b.ball_kills;
            }

            if(this.state.sortType === "primary"){
                a = a.primary_kills;
                b = b.primary_kills;
            }

            if(this.state.sortType === "single"){
                a = a.best_single_combo;
                b = b.best_single_combo;
            }

            

            if(this.state.bAscendingOrder){

                if(a < b){
                    return -1;
                }else if(a > b){
                    return 1;
                }

            }else{

                if(a < b){
                    return 1;
                }else if(a > b){
                    return -1;
                }

            }

            return 0;
        });

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const bestKill = d.best_single_combo;

            const bestKillString = (bestKill === 0) ? "" : `${bestKill} Kill${(bestKill === 1) ? "" : "s"}`;

            let currentPlayer = this.props.players[d.player_id];

            if(currentPlayer === undefined) currentPlayer = {"name": "Not Found", "country": "xx", "team": 255};

            rows.push(<tr key={i}>
                <td className={Functions.getTeamColor(currentPlayer.team)}>
                    <CountryFlag country={currentPlayer.country}/>
                    <Link href={`/pmatch/${this.props.matchId}?player=${d.player_id}`}><a>{currentPlayer.name}</a></Link>
                </td>
                <td>{Functions.ignore0(d.combo_kills)}</td>
                <td>{Functions.ignore0(d.ball_kills)}</td>
                <td>{Functions.ignore0(d.primary_kills)}</td>
                <td>{bestKillString}</td>
            </tr>);
        }

        return <Table2 width={4} players={true}>
            <tr>
                <th>Player</th>
                <th className="pointer" onClick={(() =>{
                    this.sortGeneral("combos");
                })}>
                    <Image src="/images/combo.png" alt="image" width={64} height={64}/>
                    <br/>Combo Kills
                </th>
                <th className="pointer" onClick={(() =>{
                    this.sortGeneral("balls");
                })}>
                    <Image src="/images/shockball.png" alt="image" width={64} height={64}/>
                    <br/>Shock Ball Kills
                </th>
                <th className="pointer" onClick={(() =>{
                    this.sortGeneral("primary");
                })}>
                    <Image src="/images/primary.png" alt="image" width={64} height={64}/>
                    <br/>Instagib Kills
                </th>
                <th className="pointer" onClick={(() =>{
                    this.sortGeneral("single");
                })}>
                    <Image src="/images/combo.png" alt="image" width={64} height={64}/>
                    <br/>Best Single Combo
                </th>
            </tr>
            {rows}
        </Table2>
    }

    render(){

        if(this.state.error !== null){

            return <ErrorMessage title="Combogib Stats" text={this.state.error}/>
        }

        if(this.state.data === null) return null;
        
        return <div>
            <div className="default-header">Combogib Stats</div> 
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`}>General Stats</div>
            </div>
            {this.renderBasic()}
        </div>
    }
}

export default CombogibMatchStats;