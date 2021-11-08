import React from 'react';
import Table2 from '../Table2';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import Functions from '../../api/functions';
import TrueFalse from '../TrueFalse';

class MatchCTFCapTimes extends React.Component{

    constructor(props){

        super(props);

        this.state = {"data": null}
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

            console.log(res);

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadData();
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

    }

    renderMatchCaps(){

        if(this.state.data === null) return null;
        const rows = [];

        console.log(this.state.data);


        const soloRecord = this.state.data.recordCaps.solo.travel_time;
        const assistRecord = this.state.data.recordCaps.assist.travel_time;

        for(let i = 0; i < this.state.data.matchCaps.length; i++){

            const m = this.state.data.matchCaps[i];

            const capPlayer = this.getPlayer(m.cap);

            let bSolo = true;

            if(m.assists.length > 0){

                if(m.assists[0] !== ""){
                    bSolo = false;
                }
            }
            

            let delta = Math.abs(((bSolo) ? soloRecord : assistRecord) - m.travel_time);

            let deltaClass = "team-red";
            
            if(delta === 0){
                deltaClass = "purple";
                delta = "";
            }else if(i === 0){
                deltaClass = "team-green";
                delta = `+${delta.toFixed(2)}`;
            }else{
                delta = `+${delta.toFixed(2)}`;
            }



            rows.push(<tr key={i}>
                <td>{Functions.MMSS(m.cap_time - this.props.matchStart)}</td>
                <td><Link href={`/player/${capPlayer.id}`}><a><CountryFlag host={this.props.host} country={capPlayer.country}/>{capPlayer.name}</a></Link></td>
                <TrueFalse bTable={true} value={bSolo} tDisplay={"Solo"} fDisplay={"Assisted"}/>
                <td>{m.travel_time.toFixed(2)} Seconds</td>
                <td className={deltaClass}>{delta}</td>
            </tr>);
        }

        return <Table2 width={1}>
            <tr>
                <th>Timestamp</th>
                <th>Capped By</th>
                <th>Cap Type</th>
                <th>Travel Time</th>
                <th>Delta(Type Record)</th>
            </tr>
            {rows}
        </Table2>
    }

    render(){

        return <>
            <div className="default-header">Fastest Flag Captures</div>
            {this.renderRecordTimes()}
            {this.renderMatchCaps()}
        </>
    }
}

export default MatchCTFCapTimes;