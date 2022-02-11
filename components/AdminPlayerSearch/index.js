import React from 'react';
import Loading from '../Loading';
import Table2 from '../Table2';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import Notification from '../Notification';

class AdminPlayerSearch extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 2,
            "bSearched": false,
            "nameResults": [],
            "ipResults": [],
            "bLoading": false,
            "error": null,
            "nameSearch": "",
            "ipSearch": "",
            "bExactNameSearch": false,
            "ipHistory": null,
            "ipHistoryError": null,
            "ipHistoryErrorDisplayUntil": 0

        };

        this.search = this.search.bind(this);
        this.changeMode = this.changeMode.bind(this);
        this.ipHistory = this.ipHistory.bind(this);
    }

    changeMode(id){

        this.setState({"mode": id, 
            "bSearched": false,
            "nameResults": [],
            "ipResults": [],
            "bLoading": false,
            "error": null,
            "nameSearch": "",
            "ipSearch": "",
            "bExactNameSearch": false,
            "ipHistory": null,
            "ipHistoryError": null,
            "ipHistoryErrorDisplayUntil": 0
        });
    }

    async ipHistory(e){

        try{

            e.preventDefault();

            this.setState({"bLoading": true, "ipHistoryError": null, "ipHistory": []});

            const ip = e.target[0].value;

            const reg = /(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})/i;

            const regResult = reg.exec(ip);

            if(regResult === null){
                this.setState({"bLoading": false, "ipHistoryError": "Not a valid IPv4 address."});
                return;
            }
            
            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "iphistory", "ip": ip})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"bLoading": false, "ipHistoryError": null, "ipHistory": {
                    "matchData": res.matchData,
                    "playerNames": res.playerNames
                }});

            }else{

                this.setState({"bLoading": false, "ipHistoryError": res.error});
            }

        }catch(err){
            console.trace(err);
        }
    }

    async search(e){

        try{

            e.preventDefault();
   
            const name = e.target[0].value;
            const ip = e.target[1].value;

            this.setState({
                "nameResults": [], 
                "ipResults": [], 
                "nameSearch": name,
                "ipSearch": ip,
                "error": null,
                "bLoading": true,
                "bSearched": true
            });

            const body = {};

            if(name.length > 0){
                body.name = name;
            }

            if(ip.length > 0){
                body.ip = ip;
            }
            
            if(body.name !== undefined && body.ip !== undefined){

                body.mode = "nameip";

            }else if(body.name !== undefined){

                body.mode = "namesearch";

            }else if(body.ip !== undefined){

                body.mode = "ipsearch";

            }

            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify(body)
            });


            const res = await req.json();

            console.log(res);

            if(res.error === undefined){

                this.setState({
                    "nameResults": res.names ?? [], 
                    "ipResults": res.ips ?? [], 
                    "bLoading": false,
                    "error": null
                });

            }else{

                this.setState({
                    "nameResults": [], 
                    "ipResults": [],
                    "bLoading": false, 
                    "error": res.error
                });
            }


            

            console.log(res);
            
            

        }catch(err){
            console.trace(err);
        }
    }


    renderNameSearch(){

        if(!this.state.bSearched || this.state.nameSearch === "") return null;

        let elems = null;

        if(this.state.bLoading) return <Loading />;
        
        if(this.state.error !== null){

            elems = <div>
                {this.state.error}
            </div>
        }

        if(this.state.nameResults.length > 0){

            const names = [];

            for(let i = 0; i < this.state.nameResults.length; i++){

                const r = this.state.nameResults[i];

                names.push(<tr key={i}>
                    <td className="text-left"><Link href={`/player/${r.player_id}`}><a>{r.name}</a></Link></td>
                    <td>{r.ip} <CountryFlag country={r.country}/></td>
                    <td>{Functions.convertTimestamp(r.first, true)}</td>
                    <td>{Functions.convertTimestamp(r.last, true)}</td>
                    <td>{Functions.toHours(r.playtime)} Hours</td>
                    <td>{r.total_matches}</td>
                </tr>);
            }

            elems = <Table2 width={1}>
                <tr>
                    <th>Name</th>
                    <th>IP</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Playtime</th>
                    <th>Matches</th>
                </tr>
                {names}
            </Table2>

        }


        return <div>
            <div className="default-header">Names Matching "{this.state.nameSearch}"</div>
            {elems}
        </div>
    }

    renderIPSearch(){

        if(!this.state.bSearched || this.state.ipSearch === "") return null;

        let elems = null;

        if(this.state.bLoading) return <Loading />;
        
        if(this.state.error !== null){

            elems = <div>
                {this.state.error}
            </div>
        }

        if(this.state.ipResults.length > 0){

            const names = [];

            for(let i = 0; i < this.state.ipResults.length; i++){

                const r = this.state.ipResults[i];

                names.push(<tr key={i}>
                    <td className="text-left"><Link href={`/player/${r.player_id}`}><a>{r.name}</a></Link></td>
                    <td>{r.ip} <CountryFlag country={r.country}/></td>
                    <td>{Functions.convertTimestamp(r.first ?? r.first_match, true)}</td>
                    <td>{Functions.convertTimestamp(r.last ?? r.last_match, true)}</td>
                    <td>{Functions.toHours(r.playtime)} Hours</td>
                    <td>{r.total_matches}</td>
                </tr>);
            }

            elems = <Table2 width={1}>
                <tr>
                    <th>Name</th>
                    <th>IP</th>
                    <th>First</th>
                    <th>Last</th>
                    <th>Playtime</th>
                    <th>Matches</th>
                </tr>
                {names}
            </Table2>

        }

        return <div>
            <div className="default-header">IPS Matching "{this.state.ipSearch}"</div>
            {elems}
        </div>
    }

    renderGeneralSearch(){

        if(this.state.mode !== 0) return;

        return <>
            <div className="form">
                <form action="/" method="POST" onSubmit={this.search}>
                    <div className="form-info m-bottom-25">
                        Search for a player by name or IP.
                    </div>
                    <div className="select-row">
                        <div className="select-label">Name</div>
                        <div>
                            <input type="textbox" className="default-textbox" placeholder="Name..."/>
                        </div>
                    </div>
                    <div className="select-row">
                        <div className="select-label">IP</div>
                        <div>
                            <input type="textbox" className="default-textbox" placeholder="IP..."/>
                        </div>
                    </div>
                    <input type="submit" className="search-button" value="Search"/>
                </form>
            </div>
            {this.renderIPSearch()}
            {this.renderNameSearch()}
        </>;

    }


    renderAssociatedNames(){

        const names = [];

        for(const [id, name] of Object.entries(this.state.ipHistory.playerNames)){

            names.push(<tr key={id}><td>{name}</td></tr>);
        }


        return <div key="names">
            <div className="default-header">Players Associated With IP</div>
            <Table2 width={3}>
                <tr>
                    <th>Name</th>
                </tr>
                {names}
            </Table2>
        </div>;

    }

    renderIPHistoryList(){

        const rows = [];

        for(let i = 0; i < this.state.ipHistory.matchData.length; i++){

            const m = this.state.ipHistory.matchData[i];

            rows.push(<tr key={i}>
                <td>{m.match_id}</td>
                <td>{Functions.convertTimestamp(m.match_date, true)}</td>
                <td>{this.state.ipHistory.playerNames[m.player_id] ?? "Not Found"}</td>
            </tr>);
        }

        return <div>
            <div className="default-header">IP History</div>
            <Table2 width={2}>
                <tr>
                    <th>Match ID</th>
                    <th>Date</th>
                    <th>Used Name</th>
                </tr>
                {rows}
            </Table2>
        </div>

    }

    renderIPHistory(){

        if(this.state.mode !== 2) return null;

        const notification = (this.state.ipHistoryError === null) ? null : 
            <Notification type="error" displayUntil={Math.ceil(Date.now() * 0.001) + 5}>
                {this.state.ipHistoryError}
            </Notification>;

        const loading = (this.state.bLoading) ? <Loading/> : null; 


        let results = [];

        if(!this.state.bLoading && this.state.ipHistory !== null){

            results.push(this.renderAssociatedNames());
            results.push(this.renderIPHistoryList());
   
        }


        return <>
            <div className="form">
                <div className="form-info m-bottom-25">
                    Search the history of a given IP, exact matching only.
                </div>
                <form action="/" method="POST" onSubmit={this.ipHistory}>
                    <div className="select-row">
                        <div className="select-label">
                            IP
                        </div>
                        <div>
                            <input type="text" className="default-textbox" placeholder="192.168.56.1"/>
                        </div>
                    </div>
                    <input type="submit" className="search-button" value="Search"/>
                </form>
            </div>
            {loading}
            {results}
            {notification}
        </>;
    }

    render(){

        return <div>
            <div className="default-header">Player Search</div>
            <div className="tabs">
                <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : null }`} onClick={(() =>{
                    this.changeMode(0);
                })}>General Search</div>
                <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : null }`} onClick={(() =>{
                    this.changeMode(1);
                })}>Player History</div>
                <div className={`tab ${(this.state.mode === 2) ? "tab-selected" : null }`} onClick={(() =>{
                    this.changeMode(2);
                })}>IP History</div>
            </div>
            {this.renderGeneralSearch()}
            {this.renderIPHistory()}

        </div>
    }
}

export default AdminPlayerSearch;