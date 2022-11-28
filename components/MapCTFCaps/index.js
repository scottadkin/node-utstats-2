import React from 'react';
import Table2 from '../Table2';
import CountryFlag from '../CountryFlag';
import Functions from '../../api/functions';
import Link from 'next/link';
import SimplePagiationLinks from '../SimplePaginationLinks';

class MapCTFCaps extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": [], "totals": {}, "finishedLoading": false};

    }

    async loadCaps(){

        const req = await fetch("/api/ctf", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": "fastestcaps", 
                "mapId": this.props.mapId,
                "page": this.props.page - 1,
                "perPage": 10,
                "setDetails": true,
                "type": (this.props.mode === 0) ? "solo" : "assists"
            })
        });

        const res = await req.json();

        if(res.error === undefined){

            this.setState({"data": res});
        }

    }

    async loadTotals(){

        const req = await fetch("/api/ctf", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "totalcaps", "mapId": this.props.mapId})
        });

        const res = await req.json();

        if(res.error === undefined){

            this.setState({"totals": res.data});
        }
    }

    async loadData(){

        try{

            await this.loadTotals();
            await this.loadCaps();

            this.setState({"finishedLoading": true});

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidUpdate(prevProps){


        if(prevProps.mapId !== this.props.mapId || prevProps.page !== this.props.page || prevProps.mode !== this.props.mode){

            await this.loadTotals();
            await this.loadCaps();

        }
    }

    async componentDidMount(){

        await this.loadData();
    }

    renderData(){

        if(!this.state.finishedLoading) return null;

        const rows = [];

        for(let i = 0; i < this.state.data.data.length; i++){

            const cap = this.state.data.data[i];

            let offsetElem = null;

            if(cap.offset === 0){
                offsetElem = <td className="purple">Map Record</td>
            }else{
                offsetElem = <td className="team-red">+{Functions.capTime(cap.offset)}</td>;
            }

            const place = i + 1 + ((this.props.page - 1) * this.props.perPage);

            let assistElem = null;

            if(this.props.mode === 1){

                const elems = [];

                for(let x = 0; x < cap.assistPlayers.length; x++){

                    const player = cap.assistPlayers[x];

                    elems.push(<span key={x}>
                        <Link href={`/player/${player.id}`}>
                            <a>
                            <CountryFlag host={this.props.host} country={player.country}/>   
                            {player.name}{(x < cap.assistPlayers.length - 1) ? ", " : ""}
                            </a>
                        </Link>
                    </span>);
                }

                assistElem = <td>
                    {elems}
                </td>;
            }

            rows.push(<tr key={i}>
                <td className="place">
                    {place}{Functions.getOrdinal(place)}
                </td>
                <td>{Functions.convertTimestamp(cap.matchDate, true)}</td>
                <td>
                    <Link href={`/player/${cap.cap}`}>
                        <a>
                            <CountryFlag host={this.props.host} country={cap.capPlayer.country}/>{cap.capPlayer.name}
                        </a>
                    </Link>
                </td>
                {assistElem}
                <td>{Functions.capTime(cap.travel_time)}</td>
                {offsetElem}
            </tr>);
        }

        let totalRecords = 0;
        let totalPages = 1;

        if(this.props.mode === 0){

            totalRecords = this.state.totals.solo;

        }else{

            totalRecords = this.state.totals.assisted;
        }

        if(totalRecords > 0){

            totalPages = Math.ceil(totalRecords / this.props.perPage);
        }

        return <>
            <SimplePagiationLinks 
                url={`/map/${this.props.mapId}?capMode=${this.props.mode}&capPage=`}
                anchor="ctf-caps" page={this.props.page} 
                perPage={this.props.perPage}
                totalResults={totalRecords}
                totalPages={totalPages}
            />
            <Table2 width={1}>
                <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Capped By</th>
                    {(this.props.mode === 1) ? <th>Assisted By</th> : null}
                    <th>Time</th>
                    <th>Offset</th>
                </tr>
                {rows}
            </Table2>
        </>
    }

    render(){

        if(!this.state.finishedLoading) return null;

        if(this.state.data.records.solo === null && this.state.data.records.assist === null) return null;

        return <>
            <div className="default-header" id="ctf-caps">Fastest CTF Caps</div>
            <div className="tabs">
                <Link href={`/map/${this.props.mapId}?capMode=0&capPage=${this.props.page}#ctf-caps`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 0) ? "tab-selected" : "" }`}>Solo Caps</div>
                    </a>
                </Link>
                <Link href={`/map/${this.props.mapId}?capMode=1&capPage=${this.props.page}#ctf-caps`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 1) ? "tab-selected" : "" }`}>Assisted Caps</div>
                    </a>
                </Link>
            </div>
            {this.renderData()}
        </>;
    }
}

export default MapCTFCaps;