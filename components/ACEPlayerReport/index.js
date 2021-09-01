import React from 'react';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';

class ACEPlayerReport extends React.Component{

    constructor(props){

        super(props);
        this.state = {"basicData": [], "joinsPage": 0, "joinsData": [], "joinsResult": 0, "joinPages": 0};

        this.previous = this.previous.bind(this);
        this.next = this.next.bind(this);

    }

    async previous(){

        if(this.state.joinsPage > 0){
            this.setState({"joinsPage": this.state.joinsPage - 1});
            await this.loadPlayerJoins(this.state.joinsPage);
        }
    }

    async next(){

        if(this.state.joinsPage < this.state.joinPages - 1){

            this.setState({"joinsPage": this.state.joinsPage + 1});
            await this.loadPlayerJoins(this.state.joinsPage);
        }
    }

    async loadPlayerInfo(){

        try{

            if(this.props.name === "") return;

            const req = await fetch("/api/ace", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "player-report", "name": this.props.name})
            });


            const res = await req.json();

            if(res.error === undefined){

                if(res.searchData.length > 0){

                    res.searchData.sort((a, b) =>{

                        a = a.last;
                        b = b.last;

                        return b-a;
                    });
                }

                this.setState({"basicData": res.searchData});
            }
            

        }catch(err){
            console.trace(err);
        }
    }

    async loadPlayerJoins(page){

        try{

            const req = await fetch("/api/ace", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "player-joins", "name": this.props.name, "page": page, "perPage": 25})
            });

            const res = await req.json();

            if(res.error === undefined){

                const pages = (res.results > 0) ? Math.ceil(res.results / 25) : 1;

                this.setState({"joinsData": res.data, "joinsResult": res.results, "joinPages": pages});
            }

        }catch(err){
            console.trace(err);
        }

    }


    componentDidMount(){

        if(this.props.name !== ""){

            this.loadPlayerInfo();
            this.loadPlayerJoins(0);
        }
    }

    renderBasicData(){

        const rows = [];

        for(let i = 0; i < this.state.basicData.length; i++){

            const d = this.state.basicData[i];

            rows.push(<tr key={i}>
                <td><CountryFlag country={d.country}/>{d.ip}</td>
                <td>
                    <span className="yellow">HWID: </span> {d.hwid}<br/>
                    <span className="yellow">MAC1: </span> {d.mac1}<br/>
                    <span className="yellow">Mac1: </span> {d.mac2}
                </td>
                    <td>
                    <span className="yellow">First: </span> {Functions.convertTimestamp(d.first, true)}<br/>
                    <span className="yellow">Last: </span> {Functions.convertTimestamp(d.last, true)}<br/>
                </td>
                <td>
                    {d.times_connected}
                </td>
                <td>
                    {d.times_kicked}
                </td>
            </tr>);
        }

        return <div className="m-bottom-25">
            <div className="default-sub-header">Basic Summary</div>

            <table className="t-width-1">
                <tbody>
                    <tr>
                        <td>IP</td>
                        <td>Hardware Info</td>
                        <td>Dates</td>
                        <td>Times Connected</td>
                        <td>Times Kicked</td>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    renderJoins(){

        const rows = [];

        if(this.state.joinsData.length === 0) return null;

        for(let i = 0; i < this.state.joinsData.length; i++){

            const d = this.state.joinsData[i];

            rows.push(<tr key={i}>
                <td>{d.ace_version}</td>
                <td>{Functions.convertTimestamp(d.timestamp, true)}</td>
                <td><CountryFlag country={d.country}/>{d.ip}</td>
                <td>{d.os}</td>
                <td>
                    <span className="yellow">HWID:</span> {d.hwid}<br/>
                    <span className="yellow">MAC1:</span> {d.mac1}<br/>
                    <span className="yellow">MAC2:</span> {d.mac2}<br/>
                </td>
            </tr>);
        }

        return <div className="m-bottom-25">
            <div className="default-sub-header">Recent Connections</div>
            <div className="simple-pagination">
                <div onClick={this.previous}>Previous</div>
                <div>
                    <span className="yellow">Viewing Page {this.state.joinsPage + 1} of {this.state.joinPages}</span><br/>
                    Total Results {this.state.joinsResult}
                </div>
                <div onClick={this.next}>Next</div>
            </div>
            <table className="t-width-1">
                <tbody>
                    <tr>
                        <th>ACE</th>
                        <th>Date</th>
                        <th>IP</th>
                        <th>OS</th>
                        <th>Hardware Info</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    render(){

        //this.props.name

        if(this.props.name === ""){

            return <div>
                Name is empty display a form with only a name option to search, only match exact name match
            </div>
        }

        return <div>
            <div className="default-header">Player Report for {this.props.name}</div>

            {this.renderBasicData()}
            {this.renderJoins()}
        </div>
    }
}

export default ACEPlayerReport;