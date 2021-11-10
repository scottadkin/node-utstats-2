import React from 'react';
import Table2 from '../Table2';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import SimplePaginationLinks from '../SimplePaginationLinks';


class MapFastestCaps extends React.Component{

    constructor(props){

        super(props);

        this.state = {"perPage": 5, "page": 0, "data": [], "players": [], "records": {}, "mode": 0};
    }

    async loadData(){

        try{

            const req = await fetch("/api/ctf", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "fastestcaps", "mapId": this.props.mapId})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"data": res.data, "players": res.players, "records": res.records});
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

        if(this.state.players[id] !== undefined){
            return this.state.players[id];
        }

        return {"name": "Not Found", "id": -1, "country": "xx"};
    }

    renderTable(){

        if(this.state.data.length === 0) return null;

        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            const place = i + (this.state.perPage * this.state.page) + 1;

            const player = this.getPlayer(d.cap);

            let offset = 0;

            if(this.state.records.solo !== null){

                offset = Math.abs(this.state.records.solo.travel_time - d.travel_time);
            }

            let offsetClass = "team-red";

            if(offset === 0){
                offset = "";
                offsetClass = "purple";
            }else{
                offset = `+ ${offset.toFixed(2)}`
            }

            rows.push(<tr key={i}>
                <td>{place}{Functions.getOrdinal(place)}</td>
                <td></td>
                <td></td>
                <td>
                    <Link href={`/player/${d.cap}`}>
                        <a>
                            <CountryFlag host={this.props.host} country={player.country}/>{player.name}
                        </a>
                    </Link>
                </td>
                <td>{d.travel_time.toFixed(2)}</td>
                <td className={offsetClass}>{offset}</td>
            </tr>);
        }


        return <Table2 width={1}>
            <tr>
                <th>#</th>
                <th>Date</th>
                <th>Assists</th>
                <th>Capped</th>
                <th>Travel Time</th>
                <th>Offset</th>
            </tr>
            {rows}
        </Table2>
    }

    render(){

        return <>
            <div className="default-header">Map Fastest Caps</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`}>All Caps</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`}>Solo Caps</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : ""}`}>Assisted Caps</div>
            </div>
            <SimplePaginationLinks url={`/map/${this.props.mapId}?caps=`} page={this.state.page + 1}/>
            {this.renderTable()}
        </>
    }
}

export default MapFastestCaps;