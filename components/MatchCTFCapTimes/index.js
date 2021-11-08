import React from 'react';
import Table2 from '../Table2';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';

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

        return {"name": "Not Found", "country": "xx", "id": -1};
    }

    renderRecordTimes(){

        if(this.state.data === null) return null;

        let soloRecordElem = null;
        let assistRecordElem = null;


        if(this.state.data.recordCaps.solo !== undefined){

            if(this.state.data.recordCaps.solo === null){

                soloRecordElem = <tr>
                    <td colSpan={5} className="team-red" style={{"textAlign":"center"}}>No Map Record</td>           
                </tr>
             

            }else{

                const player = this.getPlayer(this.state.data.recordCaps.solo.cap);

                const cap = this.state.data.recordCaps.solo;

                let colSpan = 4;
                let linkElem = null;

                if(cap.match_id !== this.props.matchId){
                    colSpan = 3;
                    linkElem = <td className="purple"><Link href={`/match/${cap.match_id}`}><a>View Match</a></Link></td>
                }
                

                soloRecordElem = <tr>
                    <td className="purple text-left"><CountryFlag country={player.country} host={this.props.host}/>{player.name}</td>
                    {linkElem}
                    <td className="purple text-right" colSpan={colSpan}>{cap.travel_time.toFixed(3)} Seconds</td>              
                </tr>
                
            }
        }


        if(this.state.data.recordCaps.assist !== undefined){

            if(this.state.data.recordCaps.assist === null){

                assistRecordElem = <tr>
                    <td colSpan={5} className="team-red" style={{"textAlign":"center"}}>No Map Record</td>           
                </tr>;
            }else{

                const player = this.getPlayer(this.state.data.recordCaps.assist.cap);

                const cap = this.state.data.recordCaps.assist;

                let colSpan = 3;
                let linkElem = null;

                if(cap.match_id !== this.props.matchId){
                    colSpan = 1;
                    linkElem = <td className="purple"><Link href={`/match/${cap.match_id}`}><a>View Match</a></Link></td>
                }

                let assistElems = [];

                for(let i = 0; i < cap.assists.length; i++){

                    const c = parseInt(cap.assists[i]);

                    const currentPlayer = this.getPlayer(c);

                    assistElems.push(<div key={i}>
                        <Link href={`/player/${currentPlayer.id}`}>
                            <a>
                                <CountryFlag country={currentPlayer.country} host={this.props.host}/>{currentPlayer.name}
                            </a>
                        </Link>
                    </div>);
                    
                }

                assistRecordElem = <tr>
                    <td className="purple">
                        <span className="yellow">Capped By</span><br/>
                        <Link href={`/player/${player.id}`}><a><CountryFlag host={this.props.host} country={player.country}/>{player.name}</a></Link>
                    </td>
                    <td className="purple" colSpan={colSpan}><span className="yellow">Assisted By</span><br/>{assistElems}</td>
                    {linkElem}
                    <td className="purple text-right">{cap.travel_time.toFixed(3)} Seconds</td>
                </tr>
            }
        }
        
        return <>
            <Table2 width={2} players={true}>
                <tr>
                    <th colSpan={5}>Map Record (Solo Cap)</th>
                </tr>
                {soloRecordElem}
                <tr>
                    <th colSpan={5}>Map Record (Assisted Cap)</th>
                </tr>
                {assistRecordElem}
            </Table2>
        </>
    }

    render(){

        return <>
            <div className="default-header">Fastest Flag Captures</div>
            {this.renderRecordTimes()}
        </>
    }
}

export default MatchCTFCapTimes;