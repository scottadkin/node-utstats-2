import React from 'react';
import Table2 from '../Table2';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import styles from './MapFastestCaps.module.css';
import SimplePaginationLinks from '../SimplePaginationLinks';


class MapFastestCaps extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "perPage": this.props.perPage ?? 10, 
            "data": [], 
            "players": [], 
            "records": {}, 
            "mode": this.props.mode, 
            "matchDates": {},
            "totalCaps": 0,
            "finishedLoading": false
        };

        this.changePage = this.changePage.bind(this);
        this.changeMode = this.changeMode.bind(this);
    }

    async changeMode(id){

       // if(id === this.state.mode) return;

        this.setState({"mode": id});
        this.loadData(this.props.page, id);
    }

    async changePage(page){

        page--;
        if(page < 0) page = 0;


        let max = 0;

        if(this.state.totalCaps > 0 && this.state.perPage > 0){

            max = Math.ceil(this.state.totalCaps / this.state.perPage) - 1;
            
        }

        if(page > max) page = max;

        await this.loadData(page, this.state.mode);

    }

    async loadData(page, type){

        try{

            if(this.props.mapId === -1) return;

            if(type === 1) type = "solo";
            else if(type === 2) type = "assists";

            this.setState({"finishedLoading": false});

            const req = await fetch("/api/ctf", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({
                    "mode": "fastestcaps", 
                    "mapId": this.props.mapId, 
                    "page": page - 1, 
                    "perPage": this.state.perPage,
                    "type": type
                })
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({
                    "data": res.data,
                    "players": res.players, 
                    "records": res.records,
                    "matchDates": res.matchDates,
                    "totalCaps": res.totalCaps,
                    "finishedLoading": true
                });
            }

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadData(this.props.page - 1, this.state.mode);

    }

    async componentDidUpdate(prevProps){

        if(prevProps.mapId !== this.props.mapId || prevProps.mode !== this.props.mode || prevProps.page !== this.props.page){
            this.changeMode(this.props.mode);
        }
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

        if(this.state.data.length === 0) return <Table2 width={1}><tr><td>No Data</td></tr></Table2>

        //if(!this.state.finishedLoading) return null;

        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            const place = i + (this.props.perPage * (this.props.page - 1)) + 1;

            const player = this.getPlayer(d.cap);

            let offset = 0;

            if(this.state.records.solo !== null && this.state.records.assist !== null){

                if(this.state.mode === 0){

                    if(this.state.records.solo.travel_time <= this.state.records.assist.travel_time){
                        offset = Math.abs(this.state.records.solo.travel_time - d.travel_time);
                    }else{
                        offset = Math.abs(this.state.records.assist.travel_time - d.travel_time);
                    }
                }
            }

            if(this.state.records.solo !== null && this.state.mode < 2){

                offset = Math.abs(this.state.records.solo.travel_time - d.travel_time);
            }

            if(this.state.records.assist !== null && this.state.mode === 2){
                offset = Math.abs(this.state.records.assist.travel_time - d.travel_time);
            }

            let offsetClass = "team-red";

            if(offset === 0){
                offset = "";
                offsetClass = "purple";
            }else{
                offset = `+ ${offset.toFixed(2)}`
            }

            const timestamp = this.getDate(d.match_id);

            let assistElems = [];

            const assists = d.assists;

            for(let x = 0; x < assists.length; x++){

                const a = assists[x];

                const currentPlayer = this.getPlayer(a);

                assistElems.push(<React.Fragment key={`${i}_${Math.floor(Math.random() * 999999)}`}>
                    <Link href={`/player/${currentPlayer.id}`}>
                        
                        <CountryFlag host={this.props.host} country={currentPlayer.country}/>{currentPlayer.name}
                        
                    </Link>
                    {(x < assists.length - 1) ? ", " : ""}
                </React.Fragment>);

               
            }

            if(this.state.mode !== 1){

                if(assistElems.length === 0){
                    assistElems = <>None</>
                }
            }

            rows.push(<tr key={i}>
                <td>{place}{Functions.getOrdinal(place)}</td>
                <td><Link href={`/match/${d.match_id}`}>{Functions.convertTimestamp(timestamp, true)}</Link></td>
                {(this.state.mode !== 1) ? <td>{assistElems}</td> : null}
                <td>
                    <Link href={`/player/${d.cap}`}>
                        
                        <CountryFlag host={this.props.host} country={player.country}/>{player.name}
                        
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
                {(this.state.mode !== 1) ? <th>Assists</th> : null }
                <th>Capped</th>
                <th>Travel Time</th>
                <th>Offset</th>
            </tr>
            {rows}
        </Table2>
    }

    render(){

        let totalPages = 1;

        if(this.state.totalCaps > 0){

            totalPages = Math.floor(this.state.totalCaps / this.props.perPage);
        }

        return <div className={styles.table}>
            <div className="default-header">{this.props.mapName} Fastest Caps</div>
            <div className="tabs">
            <Link href={`/ctfcaps?map=${this.props.mapId}&submode=0`}>
                
                    <div className={`tab ${(this.props.mode === 0) ? "tab-selected" : ""}`} >All Caps</div>
                
            </Link>
            <Link href={`/ctfcaps?map=${this.props.mapId}&submode=1`}>
                
                    <div className={`tab ${(this.props.mode === 1) ? "tab-selected" : ""}`} >Solo Caps</div>
                
            </Link>
            <Link href={`/ctfcaps?map=${this.props.mapId}&submode=2`}>
                
                    <div className={`tab ${(this.props.mode === 2) ? "tab-selected" : ""}`} >Assisted Caps</div>
                
            </Link>
            </div>
            <SimplePaginationLinks 
                url={`/ctfcaps/?mode=0&map=${this.props.mapId}&submode=${this.props.mode}&page=`} 
                page={this.props.page} 
                totalPages={totalPages} 
                totalResults={this.state.totalCaps}
            />
            {this.renderTable()}
        </div>
    }
}

export default MapFastestCaps;