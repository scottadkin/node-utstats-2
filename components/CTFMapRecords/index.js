import React from 'react';
import Table2 from '../Table2';
import Functions from '../../api/functions';
import styles from './CTFMapRecords.module.css';
import Link from 'next/link';
import CountryFlag from '../CountryFlag';

class CTFMapRecords extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "mode": this.props.mode, 
            "mapIds": [], 
            "caps": {}, 
            "matchDates": {}, 
            "finishedLoading": false,
            "playerNames": {}
        };
        this.changeMode = this.changeMode.bind(this);
 
    }

    async loadData(mapIds){

        try{

            this.setState({"finishedLoading": false});

            const req = await fetch("/api/ctf", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "maprecords", "mapIds": mapIds})
            });

            const res = await req.json();

            this.setState({"finishedLoading": true});

            if(res.error === undefined){

                this.setState({"caps": res.data, "matchDates": res.matchDates, "playerNames": res.playerNames});
            }
            console.log(res);

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        const mapIds = [];

        for(let i = 0; i < this.props.maps.length; i++){

            const m = this.props.maps[i].id;
            mapIds.push(m)
        }

        this.setState({"mapIds": mapIds});

        await this.loadData(mapIds);
    }

    changeMode(id){

        this.setState({"mode": id});
    }

    getDate(matchId){

        if(this.state.matchDates[matchId] !== undefined){
            return this.state.matchDates[matchId];
        }

        return 0;
    }

    getPlayer(playerId){
        
        if(this.state.playerNames[playerId] !== undefined){
            return this.state.playerNames[playerId];
        }

        return {"name": "Not Found", "country": "xx", "id": -1};
    }

    renderData(){

        if(!this.state.finishedLoading) return null;

        const rows = [];

        for(let i = 0; i < this.props.maps.length; i++){

            const m = this.props.maps[i];

            const mapData = this.state.caps[m.id];

            if(mapData === undefined) continue;

            let data = null;

            if(this.state.mode === 0){

                if(mapData.solo !== null){
                    data = mapData.solo;
                }

            }else{

                if(mapData.assisted !== null){
                    data = mapData.assisted;
                }
            }

            if(data === null) continue;

            const capPlayer = this.getPlayer(data.cap);

            rows.push(<tr key={i}>
                <td className="text-left">{m.name}</td>
                <td>{Functions.convertTimestamp(this.getDate(data.match_id), true)}</td>
                {(this.state.mode === 1) ? <td></td> : null }
                <td>
                    <Link href={`/player/${capPlayer.id}`}>
                        <a>
                            <CountryFlag host={this.props.host} country={capPlayer.country}/>{capPlayer.name}
                        </a>
                    </Link>
                </td>
                <td>{Functions.capTime(data.travel_time)}</td>
            </tr>);
        }

        return <div className={styles.table}>
                <Table2 width={1}>
                <tr>
                    <th>Map</th>
                    <th>Date</th>
                    {(this.state.mode === 1) ? <th>Assists</th> : null }
                    <th>Cap</th>
                    <th>Record</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    render(){

        return <div>
            <div className="default-header">Current Map Records</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(0);
                })}>Solo Caps</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.changeMode(1);
                })}>Assisted Caps</div>
            </div>
            {this.renderData()}
        </div>
    }
}

export default CTFMapRecords;