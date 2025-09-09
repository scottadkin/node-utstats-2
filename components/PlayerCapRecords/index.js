import React from 'react';
import Link from 'next/link';
import Table2 from '../../../../components/Table2';
import Functions from '../../../../api/functions';


class PlayerCapRecords extends React.Component{

    constructor(props){

        super(props);

        this.state = {"bFinishedLoading": false, "soloCaps": [], "assistedCaps": [], "mode": 0};

        this.setMode = this.setMode.bind(this);
    }

    setMode(id){

        this.setState({"mode": id});
    }

    async loadData(){

        try{

            const req = await fetch("/api/ctf", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "singleplayercaprecords", "playerId": this.props.playerId})
            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"bFinishedLoading": true, "soloCaps": res.data.soloCaps, "assistedCaps": res.data.assistedCaps});
            }

        }catch(err){
            console.trace(err);
        }
    }

    componentDidMount(){

        this.loadData();
    }

    renderRecords(mode){

        if(this.state.mode !== mode || !this.state.bFinishedLoading) return null;

        const rows = [];

        const records = (mode === 0) ? this.state.soloCaps : this.state.assistedCaps;

        records.sort((a, b) =>{

            a = a.mapName;
            b = b.mapName;

            if(a > b){  
                return 1;
            }else if(a < b){
                return -1;
            }

            return 0;
        });

        for(let i = 0; i < records.length; i++){

            const r = records[i];

            rows.push(<tr key={i}>
                <td className="text-left">
                    <Link href={`/map/${r.map_id}`}>
                        
                            {r.mapName}
                        
                    </Link>
                </td>
                <td>
                    <Link href={`/match/${r.match_id}`}>
                    
                            {Functions.convertTimestamp(r.match_date, true)}
                        
                    </Link>
                </td>
                <td className="purple">{r.travel_time.toFixed(2)} Seconds</td>
            </tr>);
        }

        if(rows.length === 0){
            rows.push(<tr>
                <td colSpan={3} style={{"textAlign":"center"}}>Player has no records of this type.</td>
            </tr>);
        }

        return <Table2 width={4} >
            <tr>
                <th>Map</th>
                <th>Date of Record</th>
                <th>Cap Time</th>
            </tr>
            {rows}
        </Table2>
    }


    render(){

        if(!this.state.bFinishedLoading) return null;

        if(this.state.soloCaps.length === 0 && this.state.assistedCaps.length === 0){
            return null;
        }

        return <div id="capRecordsMode">
            <div className="default-header">Capture the Flag Cap Records</div>
            <div className="tabs">  
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : ""}`} onClick={(() =>{
                    this.setMode(0);
                })}>Solo Caps</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : ""}`}  onClick={(() =>{
                    this.setMode(1);
                })}>Assisted Caps</div>              
            </div>

            {this.renderRecords(0)}
            {this.renderRecords(1)}
        </div>
    }

}

export default PlayerCapRecords;