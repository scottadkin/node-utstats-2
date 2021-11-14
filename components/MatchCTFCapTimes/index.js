import React from 'react';
import Table2 from '../Table2';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import Functions from '../../api/functions';
import TrueFalse from '../TrueFalse';

class MatchCTFCapTimes extends React.Component{

    constructor(props){

        super(props);

        this.state = {"data": null, "mode": 0};
        this.changeMode = this.changeMode.bind(this);
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    async loadData(){

        try{

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "fastestcaps", "matchId": this.props.matchId, "mapId": this.props.mapId})

            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"data": res.data});
            }


        }catch(err){
            console.trace(err);
        }
    }

    componentDidUpdate(prevProps){

        if(prevProps !== this.props){
            this.setState({"mode": 0})
        }
    }

    async componentDidMount(){

        await this.loadData();
    }

    async componentDidUpdate(prevProps){

        if(this.props !== prevProps){
            await this.loadData();
        }
    }


    getPlayer(id){

        if(this.state.data.recordCaps.playerNames !== undefined){

            for(let i = 0; i < this.state.data.recordCaps.playerNames.length; i++){

                const p = this.state.data.recordCaps.playerNames[i];
                if(p.id === id) return p;

            }
        }

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            if(p.id === id) return p;
        }

        return {"name": "Not Found", "country": "xx", "id": -1};
    }

    renderRecordTimes(){

        if(this.state.data === null) return null;

        let soloElem = null;
        let assistElem = null;

        if(this.state.data.recordCaps.solo !== null){
            
            const cap = this.state.data.recordCaps.solo;
            const player = this.getPlayer(cap.cap);

            soloElem = <tr>
                <td><Link href={`/match/${cap.match_id}#fastest-caps`}><a>Solo Cap</a></Link></td>
                <td>
                    <Link href={`/player/${player.id}`}>
                        <a>
                            <CountryFlag host={this.props.host} country={player.country}/>
                            {player.name}
                        </a>
                    </Link>
                </td>
                <td className="purple">{cap.travel_time.toFixed(2)} Seconds</td>
            </tr>

        }else{
            soloElem = <tr>
                <td colSpan={4}>No Record</td>
            </tr>
        }

        if(this.state.data.recordCaps.assist !== null){

            const cap = this.state.data.recordCaps.assist;

            const playerElems = [];

            const playerIds = [cap.cap];

            for(let i = 0; i < cap.assists.length; i++){

                const id = parseInt(cap.assists[i]);

                if(id === id){
                    if(playerIds.indexOf(id) === -1) playerIds.push(id);
                }
            }

            for(let i = 0; i < playerIds.length; i++){

                const p = this.getPlayer(playerIds[i]);

                playerElems.push(<React.Fragment key={i}>
                    <Link href={`/player/${p.id}`}><a><CountryFlag host={this.props.host} country={p.country}/>{p.name}</a></Link>
                    {(i < playerIds.length - 1) ? ", " : ""}
                </React.Fragment>);
            }

            assistElem = <tr>
                <td><Link href={`/match/${cap.match_id}#fastest-caps`}><a>Assisted Cap</a></Link></td>
                <td>
                    {playerElems}
                </td>
                <td className="purple">{cap.travel_time.toFixed(2)} Seconds</td>
            </tr>

        }


        return <Table2 width={1}>
            <tr>
                <th>Record</th>
                <th>Capped By</th>
                <th>Time</th>
            </tr>
            {soloElem}
            {assistElem}
        </Table2>

    }

    renderMatchCaps(){

        if(this.state.data === null) return null;
        const rows = [];


        const recordCaps = this.state.data.recordCaps;

        const soloRecord = (recordCaps.solo !== null) ? recordCaps.solo.travel_time : 0;
        const assistRecord = (recordCaps.assist !== null) ? recordCaps.assist.travel_time : 0;

        let fastest = null;

        for(let i = 0; i < this.state.data.matchCaps.length; i++){

            const m = this.state.data.matchCaps[i];

            const capPlayer = this.getPlayer(m.cap);

            let bSolo = true;

            if(m.assists.length > 0){

                if(m.assists[0] !== ""){
                    bSolo = false;
                }
            }
            
            if(this.state.mode === 0){
                if(!bSolo) continue; 
            }

            if(this.state.mode === 1){
                if(bSolo) continue; 
            }

            if(fastest === null){
                fastest = m.travel_time;
            }

            let recordDelta = Math.abs(((bSolo) ? soloRecord : assistRecord) - m.travel_time);
            let delta = Math.abs(fastest - m.travel_time);

            let deltaClass = "team-red";
            
            if(recordDelta === 0){
                deltaClass = "purple";
                delta = "Map Record";
            }else if(rows.length === 0){

                deltaClass = "team-green";
                if(delta !== 0){
                    delta = `+${delta.toFixed(2)}`;
                }else{
                    delta = "";
                }

            }else{
                delta = `+${delta.toFixed(2)}`;
            }

            rows.push(<tr key={i}>
                <td>{Functions.MMSS(m.cap_time - this.props.matchStart)}</td>
                <td><Link href={`/player/${capPlayer.id}`}><a><CountryFlag host={this.props.host} country={capPlayer.country}/>{capPlayer.name}</a></Link></td>
                {(this.state.mode === 2) ? <TrueFalse bTable={true} value={bSolo} tDisplay={"Solo"} fDisplay={"Assisted"}/> : null}
                <td>{m.travel_time.toFixed(2)} Seconds</td>
                <td className={deltaClass}>{delta}</td>
            </tr>);
        }

        if(rows.length === 0){

            rows.push(<tr key={-1}>
                <td colSpan={5}>No Events Found</td>
            </tr>);
        }

        return <div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Solo Caps</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Assisted Caps</div>
            </div>
            <Table2 width={1}>
                <tr>
                    <th>Timestamp</th>
                    <th>Capped By</th>
                    {(this.state.mode === 2) ? <th>Cap Type</th> : null}
                    <th>Travel Time</th>
                    <th>Offset</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    render(){

        if(this.state.data === null) return null;


        const d = this.state.data;

        if(d.matchCaps.length === 0 && d.players.length === 0 && d.recordCaps.solo === null && d.recordCaps.assist === null){
            return null;
        }

        return <>
            <div className="default-header" id="fastest-caps">Fastest Flag Captures</div>
            {this.renderRecordTimes()}
            {this.renderMatchCaps()}
        </>
    }
}

export default MatchCTFCapTimes;