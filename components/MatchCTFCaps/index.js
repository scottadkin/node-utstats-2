import React from 'react';
import Functions from '../../api/functions';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import InteractiveTable from '../InteractiveTable';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';
import MouseOver from "../MouseOver";
import CapChart from '../CapChart';


class MatchCTFCaps extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 1,
            "bLoading": true, 
            "error": null, 
            "caps": null, 
            "assists": null,
            "covers": null,
            "selfCovers": null,
            "seals": null,
            "carryTimes": null
        };
    }

    changeMode(id){
        this.setState({"mode": id});
    }


    async loadData(){

        this.setState({
            "bLoading": true, 
            "caps": null, 
            "assists": null,
            "covers": null,
            "selfCovers": null,
            "seals": null,
            "carryTimes": null
        });

        const req = await fetch("/api/ctf",{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "match-caps", "matchId": this.props.matchId})
        });

        const res = await req.json();

        if(res.error !== undefined){
            this.setState({"error": res.error, "bLoading": false});
        }else{
            this.setState({
                "caps": res.caps, 
                "assists": res.assists, 
                "bLoading": false,
                "covers": res.covers,
                "selfCovers": res.selfCovers,
                "seals": res.seals,
                "carryTimes": res.carryTimes
            });
        }

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

    getAssists(capId){

        const found = {};

        const elems = [];

        for(let i = 0; i < this.state.assists.length; i++){

            const a = this.state.assists[i];

            if(a.cap_id === capId){

                if(found[a.player_id] === undefined){
                    found[a.player_id] = 0;
                }

                found[a.player_id] += a.carry_time;
            }
        }

        for(const [playerId, carryTime] of Object.entries(found)){

            const player = Functions.getPlayer(this.props.playerData, playerId);

            elems.push(<tr key={playerId} className={`text-left`}>
                <td>
                    <CountryFlag country={player.country}/>{player.name} 
                </td>
                <td>
                    {Functions.MMSS(carryTime)}
                </td>
            </tr>);
        }

        if(elems.length > 0){

            return <table>
                <tbody>
                    {elems}
                </tbody>
            </table>
        }

        return "There were no assists for this cap.";
    }

    getCoverElements(capId, bSelfCovers){

        const totalCovers = {};

        const covers = (bSelfCovers) ? this.state.selfCovers : this.state.covers;

        for(let i = 0; i < covers.length; i++){

            const c = covers[i];

            if(c.cap_id !== capId) continue;

            if(totalCovers[c.killer_id] === undefined){
                totalCovers[c.killer_id] = 0;
            }

            totalCovers[c.killer_id]++;
        }

        const elems = [];

        for(const [playerId, covers] of Object.entries(totalCovers)){

            const player = Functions.getPlayer(this.props.playerData, playerId);

            elems.push(<tr key={playerId}>
                <td className="text-left"><CountryFlag country={player.country}/>{player.name}</td>
                <td> <b className="yellow">{covers}</b></td>
            </tr>);

        }

        if(elems.length > 0){

            return <table>
                <tbody>
                    {elems}
                </tbody>
            </table>
        }

        return "There were no covers for this cap.";
    }

    getSeals(capId){

        const totals = {};

        for(let i = 0; i < this.state.seals.length; i++){

            const s = this.state.seals[i];

            if(s.cap_id === capId){

                if(totals[s.killer_id] === undefined){
                    totals[s.killer_id] = 0;
                }

                totals[s.killer_id]++;
            }
        }

        const elems = [];

        for(const [playerId, seals] of Object.entries(totals)){

            const player = Functions.getPlayer(this.props.playerData, playerId);

            elems.push(<tr key={playerId}>
                <td className="text-left"><CountryFlag country={player.country}/>{player.name}</td>
                <td> <b className="yellow">{seals}</b></td>
            </tr>);

        }

        if(elems.length > 0){

            return <table>
                <tbody>
                    {elems}
                </tbody>
            </table>
        }

        return "There were no seals for this cap.";

    }

    renderSimple(){

        const data = [];
        const headers = {
            "match_score": "Match Score",
            "grab_time": "Grab",
            "grabbed_by": "Grab By",
            "cap_time": "Cap",
            "capped_by": "Cap By",
            "travel_time": "Travel Time",
            "drop_time": "Drop Time",
            "total_drops": "Dropped",
            "total_covers": "Covers",
            "total_self_covers": "Self Covers",
            "total_seals": "Seals",
            "total_assists": "Assists",
            "total_deaths": "Deaths",
            "total_suicides": "Suicides",
        };

        let teamScores = [];

        for(let i = 0; i < this.props.totalTeams; i++){
            teamScores.push(0);
        }

        for(let i = 0; i < this.state.caps.length; i++){

            const d = this.state.caps[i];

            teamScores[d.cap_team]++;

            let teamScoreString = "";

            for(let x = 0; x < teamScores.length; x++){

                teamScoreString += `${teamScores[x]}`;

                if(x < teamScores.length - 1){
                    teamScoreString += ` - `;
                }
            }

            const grabPlayer = Functions.getPlayer(this.props.playerData, d.grab_player);
            const capPlayer = Functions.getPlayer(this.props.playerData, d.cap_player);

            const assists = this.getAssists(d.id);
            const covers = this.getCoverElements(d.id, false);
            const selfCovers = this.getCoverElements(d.id, true);
            const seals = this.getSeals(d.id);

            data.push({
                "match_score": {
                    "value": d.cap_time, 
                    "displayValue": teamScoreString, //teamScoreString, 
                    "className": Functions.getTeamColor(d.cap_team),
                    "mouseOver": {"title": "My farts smell bad", "content": "lol wtf"}
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
                "total_deaths": {
                    "value": d.total_deaths,
                    "displayValue": Functions.ignore0(d.total_deaths),
                },
                "total_suicides": {
                    "value": d.total_suicides,
                    "displayValue": Functions.ignore0(d.total_suicides),
                },
                "total_covers": {
                    "value": d.total_covers,
                    "displayValue": <MouseOver display={covers} title="Flag Covers">{Functions.ignore0(d.total_covers)}</MouseOver>,
                },
                "total_self_covers": {
                    "value": d.total_self_covers,
                    "displayValue": <MouseOver display={selfCovers} title="Flag Self Covers">{Functions.ignore0(d.total_self_covers)}</MouseOver>,
                },
                "total_seals": {
                    "value": d.total_seals,
                    "displayValue": <MouseOver display={seals} title="Flag Seals">{Functions.ignore0(d.total_seals)}</MouseOver>,
                },
                "total_assists": {
                    "value": d.total_assists,
                    "displayValue": <MouseOver display={assists} title="Flag Assists">{Functions.ignore0(d.total_assists)}</MouseOver>,
                }
            });

        }
        
        return <InteractiveTable width={1} headers={headers} data={data}/>
    }


    getCarryRanges(capId){

        const found = [];

        for(let i = 0; i < this.state.assists.length; i++){

            const assist = this.state.assists[i];

            if(assist.cap_id === capId){
                found.push(assist);
            }
        }

        return found;
    }

    getCarryTimes(capId){

        const found = [];

        for(let i = 0; i < this.state.carryTimes.length; i++){

            const c = this.state.carryTimes[i];

            if(c.cap_id === capId) found.push(c);
        }

        console.log(found, capId);

        return found;
    }

    getCovers(capId, bSelfCovers){

        const covers = [];

        for(let i = 0; i < this.state.covers.length; i++){

            const c = this.state.covers[i];

            c.bSelf = false;

            if(c.cap_id === capId){
                covers.push(c);
            }
        }

        for(let i = 0; i < this.state.selfCovers.length; i++){

            const c = this.state.selfCovers[i];
            c.bSelf = true;

            if(c.cap_id === capId){
                covers.push(c);
            }

        }

        covers.sort((a, b) =>{
            a = a.timestamp;
            b = b.timestamp;

            if(a > b){
                return 1;
            }else if(a < b){
                return -1;
            }

            return 0;
        });

        return covers
    }

    renderData(){

        if(this.state.mode === 0) return this.renderSimple();


        //return <CapChart />;

        const teamScores = [];

        for(let i = 0; i < this.props.totalTeams; i++){
            teamScores.push(0);
        }

        const elems = [];

        for(let i = 0; i < this.state.caps.length; i++){

            const cap = this.state.caps[i];

            teamScores[cap.cap_team]++;

            elems.push(<CapChart 
                key={cap.id} 
                matchId={this.props.matchId}
                teamScores={[...teamScores]} 
                capInfo={cap} 
                carryTimes={this.getCarryTimes(cap.id)}
                matchStart={this.props.matchStart}
                playerData={this.props.playerData}
                covers={this.getCovers(cap.id)}
            />);
        }

        return elems;
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
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Simple Display</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Detailed Display</div>
            </div>
            {this.renderData()}
        </div>;

    }
}

export default MatchCTFCaps;