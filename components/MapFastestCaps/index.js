import React from 'react';
import Table2 from '../Table2';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import BasicPageSelect from '../BasicPageSelect';


class MapFastestCaps extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "perPage": 10, 
            "page": 0, 
            "data": [], 
            "players": [], 
            "records": {}, 
            "mode": 0, 
            "matchDates": {},
            "totalCaps": 0
        };

        this.changePage = this.changePage.bind(this);
    }

    async changePage(page){

        if(page < 0) page = 0;


        let max = 0;

        if(this.state.totalCaps > 0 && this.state.perPage > 0){

            max = Math.ceil(this.state.totalCaps / this.state.perPage) - 1;
            
        }

        if(page > max) page = max;
        this.setState({"page": page});

        await this.loadData(page);

    }

    async loadData(page){

        try{

            console.log(`load data for page ${page}`);

            const req = await fetch("/api/ctf", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "fastestcaps", "mapId": this.props.mapId, "page": page, "perPage": this.state.perPage})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({
                    "data": res.data,
                    "players": res.players, 
                    "records": res.records,
                    "matchDates": res.matchDates,
                    "totalCaps": res.totalCaps
                });
            }

            console.log(res);

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadData(0);

    }

    getPlayer(id){

        if(this.state.players[id] !== undefined){
            return this.state.players[id];
        }

        return {"name": "Not Found", "id": -1, "country": "xx"};
    }

    getDate(matchId){

        if(this.state.matchDates[matchId] !== undefined){
            return this.state.matchDates[matchId];
        }

        return 0;
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

            const timestamp = this.getDate(d.match_id);

            rows.push(<tr key={i}>
                <td>{place}{Functions.getOrdinal(place)}</td>
                <td>{Functions.convertTimestamp(timestamp, true)}</td>
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
            <BasicPageSelect changePage={this.changePage} page={this.state.page} results={this.state.totalCaps} perPage={this.state.perPage}/>
            {this.renderTable()}
        </>
    }
}

export default MapFastestCaps;