import React from 'react';
import Table2 from '../Table2';
import Functions from '../../api/functions';

class AdminOrphanedData extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": [], "bFinishedLoading": true};
    }

    async loadData(){

        try{

            this.setState({"bFinishedLoading": false});

            const req = await fetch("/api/adminmatches", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "orphanedIds"})
            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"data": res.data});
            }


            this.setState({"bFinishedLoading": true});

            console.log(res);

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadData();
    }

    renderTable(){

        if(!this.state.bFinishedLoading) return null;

        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            rows.push(<tr key={i}>
                <td><a href={`/match/${d.id}`} target="_blank">{d.id}</a></td>
                <td>{Functions.convertTimestamp(d.date, true)}</td>
                <td>{d.serverName}</td>
                <td>{d.gametypeName}</td>
                <td>{d.mapName}</td>
                <td>{d.players}</td>
                <td>{(d.playtime / (60 * 60)).toFixed(2)} Hours</td>
            </tr>);
        }

        return <Table2 width={1}>
            <tr>
                <th>Id</th>
                <th>Date</th>
                <th>Server</th>
                <th>Gametype</th>
                <th>Map</th>
                <th>Players</th>
                <th>Playtime</th>
            </tr>
            {rows}
        </Table2>
    }

    render(){

        return <div>
            <div className="default-header">Delete Failed Imports</div>
            <div className="form m-bottom-25">
                <div className="default-sub-header-alt">Information</div>
                <div className="form-info">
                    Below you will see matches that failed to import properly at some point during the import process.<br/>
                    The main reason to use this tool is if you still find duplicate matches on your site even after 
                    you used the delete duplicate matches tool.
                </div>
                <input type="button" className="bigger-button" value="Delete Data" onClick={(() =>{
                    alert("Horse noise");
                })}/>
            </div>
            {this.renderTable()}
        </div>
    }
}


export default AdminOrphanedData;