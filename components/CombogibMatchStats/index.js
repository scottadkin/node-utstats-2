import React from "react";
import Image from "next/image";
import Table2 from "../Table2";
import CountryFlag from "../CountryFlag";
import ErrorMessage from "../ErrorMessage";
import Functions from "../../api/functions";
import Link from "next/link";
import styles from "./CombogibMatchStats.module.css";

class CombogibMatchStats extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "data": null, 
            "error": null, 
            "mode": 0, 
            "sortType": "name", 
            "statsSortBy": "kills",
            "bAscendingOrder": true,
            "bAllPlayers": (this.props.totalTeams >= 2) ? false : true
        };

        this.sortGeneral = this.sortGeneral.bind(this);
        this.changeMode = this.changeMode.bind(this);
        this.changeTeamMode = this.changeTeamMode.bind(this);

        this.changeStatsSortBy = this.changeStatsSortBy.bind(this);
        
    }

    changeStatsSortBy(type){

        if(type === this.state.statsSortBy){
            this.setState({"bAscendingOrder": !this.state.bAscendingOrder});
            return;
        }

        this.setState({"statsSortBy": type, "bAscendingOrder": true});
    }

    changeTeamMode(newMode){

        this.setState({"bAllPlayers": newMode});
    }


    changeMode(id){

        this.setState({"mode": id});
    }


    sortGeneral(type){

        let sortType = type.toLowerCase();

        if(sortType === this.state.sortType){

            this.setState({"bAscendingOrder": !this.state.bAscendingOrder});
            return;
        }

        this.setState({"sortType": sortType, "bAscendingOrder": false});
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


    sortBasic(){

        const data = JSON.parse(JSON.stringify(this.state.data));

        return data.sort((a, b) =>{

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

            if(this.state.sortType === "singleball"){
                a = a.best_single_shockball;
                b = b.best_single_shockball;
            }

            if(this.state.sortType === "insane"){

                a = a.insane_kills;
                b = b.insane_kills;
            }

            if(this.state.sortType === "singleinsane"){
                a = a.best_single_insane;
                b = b.best_single_insane;
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
    }


    getKillsString(kills){

        return (kills === 0) ? "" : `${kills} Kill${(kills === 1) ? "" : "s"}`;

    }

    renderBasicTable(rows, totals, key){

        if(rows.length === 0) return null;


        const bestSingle = this.getKillsString(totals.bestSingle);
        const bestSingleBall = this.getKillsString(totals.bestSingleShockBall);
        const bestInsane = this.getKillsString(totals.bestSingleInsane);

        const totalsRow = <tr key={`totals-${key}`}>
            <td className="color8"><b>Totals/Best</b></td>
            <td className="color8"><b>{totals.combos}</b></td>
            <td className="color8"><b>{totals.insane}</b></td>
            <td className="color8"><b>{totals.balls}</b></td>
            <td className="color8"><b>{totals.primary}</b></td>
            <td className="color8"><b>{bestSingleBall}</b></td>
            <td className="color8"><b>{bestInsane}</b></td>
            <td className="color8"><b>{bestSingle}</b></td>
        </tr>;


        const iconSize = 46;

        return <Table2 key={key} width={1} players={true}>
            <tr>
                <th>Player</th>
                <th className={`pointer`} onClick={(() =>{
                    this.sortGeneral("combos");
                })}>         
                    <Image src="/images/combo.png" alt="image" width={iconSize} height={iconSize}/>
                    <div className={styles.htext}>Combo Kills</div>
                </th>
                <th className={`pointer`} onClick={(() =>{
                    this.sortGeneral("insane");
                })}>
                    <Image src="/images/combo.png" alt="image" width={iconSize} height={iconSize}/>
                    <div className={styles.htext}>Insane Combo Kills</div>
                </th>
                <th className={`pointer`} onClick={(() =>{
                    this.sortGeneral("balls");
                })}>
                    <Image src="/images/shockball.png" alt="image" width={iconSize} height={iconSize}/>
                    <div className={styles.htext}>Shock Ball Kills</div>
                </th>
                <th className={`pointer`} onClick={(() =>{
                    this.sortGeneral("primary");
                })}>
                    <Image src="/images/primary.png" alt="image" width={iconSize} height={iconSize}/>
                    <div className={styles.htext}>Instagib Kills</div>
                </th>
                <th className={`pointer`} onClick={(() =>{
                    this.sortGeneral("singleBall");
                })}>
                    <Image src="/images/shockball.png" alt="image" width={iconSize} height={iconSize}/>
                    <div className={styles.htext}>Best ShockBall</div>
                </th>
                <th className={`pointer`} onClick={(() =>{
                    this.sortGeneral("singleInsane");
                })}>
                    <Image src="/images/combo.png" alt="image" width={iconSize} height={iconSize}/>
                    <div className={styles.htext}>Best Insane Combo</div>
                </th>
                <th className={`pointer`} onClick={(() =>{
                    this.sortGeneral("single");
                })}>
                    <Image src="/images/combo.png" alt="image" width={iconSize} height={iconSize}/>
                    <div className={styles.htext}>Best Combo</div>
                </th>

            </tr>
            {rows}
            {totalsRow}
        </Table2>
    }

    getPlayer(id){

        let player = this.props.players[id];

        if(player === undefined){
            return {"name": "Not Found", "country": "xx", "team": 255};
        }

        return player;
    }

    renderBasic(){

        if(this.state.mode !== 0) return null;

        const rows = [];

        const data = this.sortBasic();

        const teamData = [[],[],[],[]];

        const teamTotals = [
            {"combos": 0, "balls": 0, "primary": 0, "bestSingle": 0, "bestSingleShockBall": 0, "insane": 0, "bestSingleInsane": 0},
            {"combos": 0, "balls": 0, "primary": 0, "bestSingle": 0, "bestSingleShockBall": 0, "insane": 0, "bestSingleInsane": 0},
            {"combos": 0, "balls": 0, "primary": 0, "bestSingle": 0, "bestSingleShockBall": 0, "insane": 0, "bestSingleInsane": 0},
            {"combos": 0, "balls": 0, "primary": 0, "bestSingle": 0, "bestSingleShockBall": 0, "insane": 0, "bestSingleInsane": 0}
        ];

        const allTotals = {"combos": 0, "balls": 0, "primary": 0, "bestSingle": 0, "bestSingleShockBall": 0, "insane": 0, "bestSingleInsane": 0};

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            const bestKillString = this.getKillsString(d.best_single_combo);
            const bestBallKillString = this.getKillsString(d.best_single_shockball);
            const bestInsaneKillString = this.getKillsString(d.best_single_insane);

            let currentPlayer = this.getPlayer(d.player_id);

            const teamColor = (this.props.totalTeams >= 2) ? Functions.getTeamColor(currentPlayer.team) : "team-none";

            const currentElem = <tr key={i}>
                <td className={teamColor}>
                    <CountryFlag country={currentPlayer.country}/>
                    <Link href={`/pmatch/${this.props.matchId}?player=${d.player_id}`}><a>{currentPlayer.name}</a></Link>
                </td>
                <td>{Functions.ignore0(d.combo_kills)}</td>
                <td>{Functions.ignore0(d.insane_kills)}</td>
                <td>{Functions.ignore0(d.ball_kills)}</td>
                <td>{Functions.ignore0(d.primary_kills)}</td>
                <td>{bestBallKillString}</td>
                <td>{bestInsaneKillString}</td>
                <td>{bestKillString}</td>
            </tr>

            if(this.state.bAllPlayers){

                rows.push(currentElem);

                allTotals.combos += d.combo_kills;
                allTotals.balls += d.ball_kills;
                allTotals.primary += d.primary_kills;
                allTotals.insane += d.insane_kills;

                if(d.best_single_combo > allTotals.bestSingle){
                    allTotals.bestSingle = d.best_single_combo;
                }

                if(d.best_single_shockball > allTotals.bestSingleShockBall){
                    allTotals.bestSingleShockBall = d.best_single_shockball;
                }

                if(d.best_single_insane > allTotals.bestSingleInsane){
                    allTotals.bestSingleInsane = d.best_single_insane;
                }

            }else{

                if(currentPlayer.team === 255){

                    if(this.props.totalTeams >= 2){
                        continue;
                    }
                }

                teamData[currentPlayer.team].push(currentElem);

                const teamTotal = teamTotals[currentPlayer.team];

                teamTotal.combos += d.combo_kills;            
                teamTotal.balls += d.ball_kills;  
                teamTotal.primary += d.primary_kills;
                teamTotal.insane += d.insane_kills;
     
                if(d.best_single_combo > teamTotal.bestSingle){
                    teamTotal.bestSingle = d.best_single_combo;
                }

                if(d.best_single_shockball > teamTotal.bestSingleShockBall){
                    teamTotal.bestSingleShockBall = d.best_single_shockball;
                }

                if(d.best_single_insane > teamTotal.bestSingleInsane){
                    teamTotal.bestSingleInsane = d.best_single_insane;
                }
            }
        }

        if(this.state.bAllPlayers){

            return this.renderBasicTable(rows, allTotals, -1);

        }else{

            const tables = [];

            for(let i = 0; i < teamData.length; i++){

                const teamRows = teamData[i];

                tables.push(this.renderBasicTable(teamRows, teamTotals[i], i));
            }

            return tables;
        }
    }

    getTypeTitles(){

        if(this.state.mode === 1 || this.state.mode === 2){

            let bestElem = null;

            if(this.state.mode === 1){

                bestElem = <th className="pointer" onClick={(() =>{
                    this.changeStatsSortBy("best_single_combo");
                })}>Best Combo</th>

            }else{

                bestElem = <th className="pointer" onClick={(() =>{
                    this.changeStatsSortBy("best_single_shockball");
                })}>Best Single Ball</th>
            }

            return <tr>
                <th>Player</th>
                <th className="pointer" onClick={(() =>{
                    this.changeStatsSortBy("deaths");
                })}>Deaths</th>
                <th className="pointer" onClick={(() =>{
                    this.changeStatsSortBy("kills");
                })}>Kills</th>
                <th className="pointer" onClick={(() =>{
                    this.changeStatsSortBy("efficiency");
                })}>Efficiency</th>
                <th className="pointer" onClick={(() =>{
                    this.changeStatsSortBy("best_kills");
                })}>Most Kills in 1 Life</th>
                {bestElem}
            </tr>

        }else if(this.state.mode !== 0){

            return <tr>
                <th>Player</th>
                <th className="pointer" onClick={(() =>{
                    this.changeStatsSortBy("deaths");
                })}>Deaths</th>
                <th className="pointer" onClick={(() =>{
                    this.changeStatsSortBy("kills");
                })}>Kills</th>
                <th className="pointer" onClick={(() =>{
                    this.changeStatsSortBy("efficiency");
                })}>Efficiency</th>
                <th className="pointer" onClick={(() =>{
                    this.changeStatsSortBy("best_kills");
                })}>Most Kills in 1 Life</th>
            </tr>

        }

        return null;

    }


    getTypeRow(data){

        if(this.state.mode === 0) return null;

        const player = this.getPlayer(data.player_id);

        const teamColor = (this.props.totalTeams >= 2) ? Functions.getTeamColor(player.team) : "team-none";

        const playerElem = <td className={teamColor}>
            <Link href={`/pmatch/${this.props.matchId}?player=${data.player_id}`}>
                <a>
                    <CountryFlag country={player.country}/>{player.name}
                </a>
            </Link>
        </td>

        if(this.state.mode === 1 || this.state.mode === 2){

            const bestKills = (this.state.mode === 1) ? data.best_combo_kills : data.best_ball_kills;
            const kills = (this.state.mode === 1) ? data.combo_kills : data.ball_kills;
            const deaths = (this.state.mode === 1) ? data.combo_deaths: data.ball_deaths;
            const eff = (this.state.mode === 1) ? data.combo_efficiency : data.ball_efficiency;

            return <tr key={`${this.state.mode}-${data.player_id}`}>
                {playerElem}
                <td>{Functions.ignore0(deaths)}</td>
                <td>{Functions.ignore0(kills)}</td>
                <td>{eff.toFixed(2)}%</td>
                <td>{Functions.ignore0(bestKills)}</td>
                <td>{this.getKillsString((this.state.mode === 1) ? data.best_single_combo : data.best_single_shockball)}</td>
            </tr>

        }else{

            let kills =  data.primary_kills;
            let deaths = data.primary_deaths;
            let best =  data.best_primary_kills;

            const eff = data.primary_efficiency;

            return <tr key={`${this.state.mode}-${data.player_id}`}>
                {playerElem}
                <td>{Functions.ignore0(deaths)}</td>
                <td>{Functions.ignore0(kills)}</td>
                <td>{eff.toFixed(2)}%</td>
                <td>{best}</td>
            </tr>

        }
    }


    updateTeamTotal(teamTotals, data, player){

        const t = teamTotals[player.team];
        const d = data;
        
        if(this.state.mode === 1){

            t.kills += d.combo_kills;
            t.deaths += d.combo_deaths;

            if(d.best_combo_kills > t.mostKills){
                t.mostKills = d.best_combo_kills;
            }

            if(d.best_single_combo > t.bestSingle){
                t.bestSingle = d.best_single_combo;
            }

        }else if(this.state.mode === 2){

            t.kills += d.ball_kills;
            t.deaths += d.ball_deaths;

            if(d.best_ball_kills > t.mostKills){
                t.mostKills = d.best_ball_kills;
            }

            if(d.best_single_shockball > t.bestSingle){
                t.bestSingle = d.best_single_shockball;
            }

        }else if(this.state.mode === 3){

            t.kills += d.primary_kills;
            t.deaths += d.primary_deaths;

            if(d.best_primary_kills > t.mostKills){
                t.mostKills = d.best_primary_kills;
            }
            
        }
    }

    sortStatsType(data){

        const sortType = this.state.statsSortBy;
        const mode = this.state.mode;

        let prefix = "combo";

        if(mode === 2){
            prefix = "ball";
        }else if(mode === 3){
            prefix = "primary";
        }

        let key = "";

        if(sortType !== "best_single_combo" && sortType !== "best_single_shockball" && sortType !== "best_kills"){

            key = `${prefix}_${sortType}`;

        }else if(sortType === "best_kills"){
            
            key = `best_${prefix}_kills`;
            
        }else{
            key = sortType;
        }

        data.sort((a, b) =>{

            a = a[key];
            b = b[key];

            if(a < b){
                return (!this.state.bAscendingOrder) ? -1 : 1;
            }else if(a > b){
                return (!this.state.bAscendingOrder) ? 1 : -1;
            }

            return 0;
        });

    }

    renderTypeStats(){

        if(this.state.mode === 0) return null;

        let titlesRow = this.getTypeTitles();

        let image = "combo.png";

        if(this.state.mode === 2){
            image = "shockball.png";
        }else if(this.state.mode === 3){
            image = "primary.png";
        }


        const rows = [];

        const teamRows = [[],[],[],[]];

        const teamTotals = [
            {"kills": 0,"deaths": 0,"mostKills": 0,"bestSingle": 0},
            {"kills": 0,"deaths": 0,"mostKills": 0,"bestSingle": 0},
            {"kills": 0,"deaths": 0,"mostKills": 0,"bestSingle": 0},
            {"kills": 0,"deaths": 0,"mostKills": 0,"bestSingle": 0},
        ];

        const orderedStats = JSON.parse(JSON.stringify(this.state.data));

        this.sortStatsType(orderedStats);

 
        for(let i = 0; i < orderedStats.length; i++){

            const d = orderedStats[i];

            if(this.state.bAllPlayers){

                rows.push(this.getTypeRow(d));

            }else{

                const player = this.getPlayer(d.player_id);

                if(player.team >= 0 && player.team < 4){
  
                    this.updateTeamTotal(teamTotals, d, player);
                  
                    teamRows[player.team].push(this.getTypeRow(d));
                }
            }
        }

        const data = [];

        if(this.state.bAllPlayers){

            return <div>
                <div className={`${styles.imageb} t-width-1 center`}>
                    <Image src={`/images/${image}`} alt="image" width={64} height={64}/>
                </div>
                <Table2 width={1} players={true}>
                    {titlesRow}
                    {rows}
                </Table2>
            </div>
        }

        for(let i = 0; i < teamRows.length; i++){

            if(teamRows[i].length === 0) continue;

            let eff = 0;

            if(teamTotals[i].kills > 0){

                if(teamTotals[i].deaths > 0){
                    eff = (teamTotals[i].kills / (teamTotals[i].kills + teamTotals[i].deaths)) * 100
                }else{
                    eff = 100;
                }
            }


            data.push(<div key={`team-${i}`}>
                <div className={`${styles.imageb} t-width-1 center`}>
                    <Image src={`/images/${image}`} alt="image" width={64} height={64}/>
                </div>
                <Table2 width={1} players={true}>
                    {titlesRow}
                    {teamRows[i]}
                    <tr>
                        <td className="color8"><b>Totals/Best</b></td>
                        <td className="color8"><b>{teamTotals[i].deaths}</b></td>
                        <td className="color8"><b>{teamTotals[i].kills}</b></td>
                        <td className="color8"><b>{eff.toFixed(2)}%</b></td>
                        <td className="color8"><b>{teamTotals[i].mostKills}</b></td>
                        {(this.state.mode === 3) ? null : <td className="color8"><b>{this.getKillsString(teamTotals[i].bestSingle)}</b></td>}
                    </tr>
                </Table2>
            </div>);

        }
        

        return data;
    }

    renderTeamTabs(){

        if(this.props.totalTeams < 2) return null;

        return <div className="tabs">
            <div className={`tab ${(this.state.bAllPlayers) ? "tab-selected" : ""}`} onClick={(() =>{
                this.changeTeamMode(true);
            })}>All Players</div>
            <div className={`tab ${(!this.state.bAllPlayers) ? "tab-selected" : ""}`}  onClick={(() =>{
                this.changeTeamMode(false);
            })}>Separate Teams</div>
            
        </div>

    }

    render(){

        if(this.state.error !== null){

            return <ErrorMessage title="Combogib Stats" text={this.state.error}/>
        }

        if(this.state.data === null) return null;
        
        return <div>
            <div className="default-header">Combogib Stats</div> 
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>General Stats</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Combo Stats</div>
                <div className={`tab ${(this.state.mode === 4) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(4);
                })}>Insane Combo Stats</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(2);
                })}>Shock Ball Stats</div>
                <div className={`tab ${(this.state.mode === 3) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(3);
                })}>Instagib Stats</div>
            </div>
            {this.renderTeamTabs()}
            {this.renderBasic()}
            {this.renderTypeStats()}
        </div>
    }
}

export default CombogibMatchStats;