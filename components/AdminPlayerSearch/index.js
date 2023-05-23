import React from 'react';
import Loading from '../Loading';
import Table2 from '../Table2';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import Notification from '../Notification';
import BasicPageSelect from '../BasicPageSelect';

class AdminPlayerSearch extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 0,
            "bSearched": false,
            "nameResults": [],
            "ipResults": [],
            "bLoading": false,
            "error": null,
            "nameSearch": "",
            "ipSearch": "",
            "bExactNameSearch": false,
            "ipHistorySearch": "",
            "ipHistory": null,
            "ipHistoryError": null,
            "ipHistoryErrorDisplayUntil": 0,
            "ipHistoryPage": 0,
            "bLoadingNameList": true,
            "nameList": [],
            "playerHistory": null,
            "bLoadingPlayerHistory": false,
            "playerHistoryError": null,
            "playerHistoryErrorDisplayUntil": 0,
            "selectedName": null,
            "selectedId": -1,
            "aliasPage": 0,
            "connectionPage": 0,
            "bLoadingConnections": false,
            "connectionHistory": null,
            "connectionError": null,
            "connectionErrorDisplayUntil": 0
        };

        this.search = this.search.bind(this);
        this.changeMode = this.changeMode.bind(this);
        this.ipHistory = this.ipHistory.bind(this);
        this.changeIpHistoryPage = this.changeIpHistoryPage.bind(this);
        this.loadPlayerHistory = this.loadPlayerHistory.bind(this);
        this.changeAliasPage = this.changeAliasPage.bind(this);
        this.changeConnectionPage = this.changeConnectionPage.bind(this);
        this.changeNameSearch = this.changeNameSearch.bind(this);
        this.updateDropDown = this.updateDropDown.bind(this);
        this.changeIpSearch = this.changeIpSearch.bind(this);
        this.updateIpHistory = this.updateIpHistory.bind(this);

    }

    updateIpHistory(e){

        this.setState({"ipHistorySearch": e.target.value});
    }

    async changeIpSearch(ip){

        window.scrollTo(0,200);
        this.setState({"mode": 2});
        await this.ipHistory(null, ip);
    }

    async updateDropDown(e){

        this.setState({"selectedId": e.target.value, "selectedName": e.target.options[e.target.selectedIndex].text});
        await this.loadPlayerHistory(null, e.target.value);
    }

    async changeNameSearch(name, playerId){

        window.scrollTo(0,200);
        this.setState({"mode": 1, "selectedName": name, "connectionPage": 0});

        await this.loadPlayerHistory(null, playerId);
    }

    changeConnectionPage(page){

        if(page < 0) return;

        const perPage = 10;

        const totalPages = Math.floor(this.state.connectionHistory.totalConnections / perPage); 

        if(page > totalPages) return;

        this.setState({"connectionPage": page});
    }

    async componentDidUpdate(prevProps, prevState){

        if(prevState.connectionPage !== this.state.connectionPage || prevState.selectedId !== this.state.selectedId){

            if(this.state.selectedId !== null){
                await this.loadConnections();
            }
        }

    }

    async loadConnections(){

        try{

            this.setState({
                "bLoadingConnections": true,
                "connectionHistory": null,        
                "connectionError": null,
                "connectionErrorDisplayUntil": 0
            });

            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({
                    "mode": "connections",
                    "playerId": this.state.selectedId, 
                    "perPage": 10, 
                    "page": this.state.connectionPage
                })
            });

            const res = await req.json();

            

            if(res.error === undefined){

                this.setState({
                    "bLoadingConnections": false,
                    "connectionHistory": {"data": res.data, "totalConnections": res.totalConnections}     
                });

            }else{

                this.setState({
                    "bLoadingConnections": false,
                    "connectionHistory": null,        
                    "connectionError": `There was a problem loading player connection history. ${res.error}`,
                    "connectionErrorDisplayUntil": Math.ceil(Date.now() * 0.001) + 5
                });
            }

        }catch(err){
            console.trace(err);
        }
    }

    changeAliasPage(page){

        const perPage = 10;

        if(page < 0) return;

        if(page > Math.floor(this.state.playerHistory.aliases.length / perPage)) return;

        this.setState({"aliasPage": page});

    }


    async loadPlayerHistory(e, selectedId){

        try{


            if(e !== null){
                e.preventDefault();
            }

            this.setState({
                "bLoadingPlayerHistory": true, 
                "playerHistory": null, 
                "playerHistoryError": null,
                "playerHistoryErrorDisplayUntil": 0,
                "aliasPage": 0
            });


            //const playerId = parseInt(e.target[0].value) ?? this.state.selectedId;

            const playerId = selectedId ?? this.state.selectedId;

            this.setState({"selectedId": playerId});

            /*if(e !== null){
                playerId = parseInt(e.target[0].value);
            }else{
                playerId = selectedId;
            }*/

            /*if(e !== null){

                if(e.target[0].value !== -1){
                    this.setState({
                        "selectedName": this.state.nameList[e.target[0].selectedIndex -1].name,
                        "selectedId": this.state.nameList[e.target[0].selectedIndex -1].id
                    });
                }
                
            }else{
                this.setState({"selectedId": playerId});
            }*/

            const req = await fetch("/api/adminplayers",{
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "playerhistory", "playerId": playerId})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"bLoadingPlayerHistory": false, "playerHistory": res, "playerHistoryError": null});

            }else{

                this.setState({
                    "bLoadingPlayerHistory": false, 
                    "playerHistory": null, 
                    "playerHistoryError": res.error,
                    "playerHistoryErrorDisplayUntil": Math.ceil(Date.now() * 0.001) + 5
                });
            }

        }catch(err){
            console.trace(err);
        }
    }

    async loadNameList(){

        try{

            const req = await fetch("/api/adminplayers", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "allnames"})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({"bLoadingNameList": false, "nameList": res.names});
            }

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadNameList();
    }

    changeMode(id){

        this.setState({"mode": id, 
            /*"bSearched": false,
            "nameResults": [],
            "ipResults": [],
            "bLoading": false,
            "error": null,
            "nameSearch": "",
            "ipSearch": "",
            "bExactNameSearch": false,
            "ipHistory": null,
            "ipHistoryError": null,
            "ipHistoryErrorDisplayUntil": 0,
            "ipHistoryPage": 0,
            "playerHistory": null,
            "bLoadingPlayerHistory": false,
            "playerHistoryError": null,
            "playerHistoryErrorDisplayUntil": 0,
            "selectedName": null,
            "selectedId": null,
            "aliasPage": 0,
            "bLoadingConnections": false,
            "connectionHistory": null,
            "connectionError": false,
            "connectionErrorDisplayUntil": 0*/
        });
    }

    async ipHistory(e, altIP){

        try{

            if(e !== null){
                e.preventDefault();
            }

            const ip = altIP ?? e.target[0].value;

            this.setState({"bLoading": true, "ipHistoryError": null, "ipHistory": [], "ipHistorySearch": ip});

            

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

        const names = [];

        if(this.state.nameResults.length > 0){

            

            for(let i = 0; i < this.state.nameResults.length; i++){

                const r = this.state.nameResults[i];

                names.push(<tr key={i}>
                    <td className="text-left pointer" onClick={(() =>{
                        this.changeNameSearch(r.name, r.player_id);
                    })}>{r.name}</td>
                    <td className="pointer" onClick={(() =>{
                        this.changeIpSearch(r.ip)
                    })}>{r.ip} <CountryFlag country={r.country}/></td>
                    <td>{Functions.convertTimestamp(r.first, true)}</td>
                    <td>{Functions.convertTimestamp(r.last, true)}</td>
                    <td>{Functions.toHours(r.playtime)} Hours</td>
                    <td>{r.total_matches}</td>
                </tr>);
            }
        }

        if(names.length === 0){

            names.push(<tr key="0"><td colSpan="6">No data</td></tr>);
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


        return <div>
            <div className="default-header">Names Matching &quot;{this.state.nameSearch}&quot;</div>
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

        const names = [];

        if(this.state.ipResults.length > 0){

            for(let i = 0; i < this.state.ipResults.length; i++){

                const r = this.state.ipResults[i];

                names.push(<tr key={i}>
                    <td className="text-left pointer"  onClick={(() =>{
                        this.changeNameSearch(r.name, r.player_id);
                    })}>{r.name}</td>
                    <td className="pointer" onClick={(() =>{
                        this.changeIpSearch(r.ip)
                    })}>{r.ip} <CountryFlag country={r.country}/></td>
                    <td>{Functions.convertTimestamp(r.first ?? r.first_match, true)}</td>
                    <td>{Functions.convertTimestamp(r.last ?? r.last_match, true)}</td>
                    <td>{Functions.toHours(r.playtime)} Hours</td>
                    <td>{r.total_matches}</td>
                </tr>);
            }

        }

        if(names.length === 0){
            names.push(<tr key="0"><td colSpan="6">No data</td></tr>);
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

        return <div>
            <div className="default-header">IPS Matching &quot;{this.state.ipSearch}&quot;</div>
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
                            <input type="textbox" className="default-textbox" placeholder="Name..." defaultValue={this.state.nameSearch}/>
                        </div>
                    </div>
                    <div className="select-row">
                        <div className="select-label">IP</div>
                        <div>
                            <input type="textbox" className="default-textbox" placeholder="IP..." defaultValue={this.state.ipSearch}/>
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

        if(this.state.ipHistory.playerNames === undefined) return null;

        const names = [];

        for(const [id, name] of Object.entries(this.state.ipHistory.playerNames)){

            names.push(<tr key={id}><td className="pointer" onClick={(() =>{
                this.changeNameSearch(name, id);
            })}>{name}</td></tr>);
        }

        if(names.length === 0){

            names.push(<tr key="0"><td>No data</td></tr>);
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

    changeIpHistoryPage(page){

        if(page < 0) return;

        if(page > Math.floor(this.state.ipHistory.matchData.length / 10)){

            return;
        }

        this.setState({"ipHistoryPage": page});
    }

    renderIPHistoryList(){

        if(this.state.ipHistory.playerNames === undefined) return null;
        const rows = [];

        const perPage = 10;

        const start = this.state.ipHistoryPage * perPage; 

        let end = this.state.ipHistory.matchData.length;

        if(start + perPage < end){
            end = start + perPage;
        }

        for(let i = start; i < end; i++){

            const m = this.state.ipHistory.matchData[i];

            rows.push(<tr key={i}>
                <td><Link href={`/match/${m.match_id}`}>{m.match_id}</Link></td>
                <td>{Functions.convertTimestamp(m.match_date, true)}</td>
                <td>{this.state.ipHistory.playerNames[m.player_id] ?? "Not Found"}</td>
            </tr>);
        }

        if(rows.length === 0){

            rows.push(<tr key="0"><td colSpan="3">No data</td></tr>);
        }

        return <div key="ips">
            <div className="default-header">IP History</div>
            <BasicPageSelect results={this.state.ipHistory.matchData.length} perPage={perPage} changePage={this.changeIpHistoryPage}
                page={this.state.ipHistoryPage} width={2}
            />
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
                            <input type="text" className="default-textbox" placeholder="192.168.56.1" value={this.state.ipHistorySearch} onChange={this.updateIpHistory}/>
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

    renderPlayerDropDown(){

        const options = [];

        if(this.state.nameList !== null){

            for(let i = 0; i < this.state.nameList.length; i++){

                const n = this.state.nameList[i];

                options.push(<option key={i} value={n.id}>{n.name}</option>);
            }
        }

        return <select className="default-select" value={(this.state.selectedId !== -1) ? this.state.selectedId : -1} onChange={this.updateDropDown}>
            <option value="-1">Select a Player...</option>
            {options}
        </select>
    }


    renderAliases(){

        const rows = [];

        const perPage = 10;

        const totalAliases = this.state.playerHistory.aliases.length;

        const start = perPage * this.state.aliasPage;
        const end = (start + perPage > totalAliases) ? totalAliases : start + perPage;

        for(let i = start; i < end; i++){

            const a = this.state.playerHistory.aliases[i];

            rows.push(<tr key={i}>
                <td className="pointer" onClick={(() =>{
                        this.changeNameSearch(a.name, a.player_id);
                    })}>
                    
                        <CountryFlag country={a.country}/>
                        {a.name}
                        
                </td>
                <td>{Functions.convertTimestamp(a.first_match, true)}</td>
                <td>{Functions.convertTimestamp(a.last_match, true)}</td>
                <td>{a.total_matches}</td>
                <td>{Functions.toHours(a.total_playtime)} Hours</td>
            </tr>);

        }


        return <div key="aliases">
            <div className="default-header">Possible Aliases</div>
            <div className="form m-bottom-25">
                <div className="form-info">
                    Aliases based by ip matches, stats below only include stats from matches where a common ip was used and not the player profile stats.
                </div>
            </div>
            <BasicPageSelect results={this.state.playerHistory.aliases.length} perPage={perPage} changePage={this.changeAliasPage}
                page={this.state.aliasPage} width={1}
            />
            <Table2 width={1} players={true}>
                <tr>
                    <th>Player</th>
                    <th>First Seen</th>
                    <th>Last Seen</th>
                    <th>Matches</th>
                    <th>Playtime</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    renderPlayerHistoryIps(){

        const rows = [];

        for(let i = 0; i < this.state.playerHistory.usedIps.data.length; i++){

            const d = this.state.playerHistory.usedIps.data[i];

            rows.push(<tr key={i}>
                <td className="pointer" onClick={(() =>{
                        this.changeIpSearch(d.ip)
                    })}>{d.ip}</td>
                <td>{Functions.convertTimestamp(d.first_match, true)}</td>
                <td>{Functions.convertTimestamp(d.last_match, true)}</td>
                <td>{d.total_matches}</td>
                <td>{Functions.toHours(d.total_playtime)} Hours</td>
            </tr>);
        }

        return <div key="ips">
            <div className="default-header">Used IPS</div>
            <div className="form m-bottom-25">
                <div className="form-info">
                    IPs used by the profile <b>{this.state.selectedName}</b>.
                </div>
            </div>
            <Table2 width={1}>
                <tr>
                    <th>IP Address</th>
                    <th>First Used</th>
                    <th>Last Used</th>
                    <th>Total Matches</th>
                    <th>Playtime</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    renderPlayerHistory(){

        if(this.state.mode !== 1) return null;

        const loading = (this.state.bLoadingNameList) ? <Loading /> : null;

        const elems = [];

        if(this.state.bLoadingPlayerHistory){

            elems.push(<Loading key={-1}/>);
        }

        let notification = null;

        if(this.state.playerHistoryError !== null){

            notification = <Notification type="error" displayUntil={this.state.playerHistoryErrorDisplayUntil}>{this.state.playerHistoryError}</Notification>;

        }else{

            if(this.state.playerHistory !== null){

                elems.push(this.renderAliases());

                elems.push(this.renderPlayerHistoryIps());
            }
        }

        return <>
            <div className="form">
                <div className="form-info m-bottom-25">
                    Search a player&apos;s full history.
                </div>
                {loading}
                <form action="/" method="POST">
                    <div className="select-row">
                        <div className="select-label">Player</div>
                        <div>{this.renderPlayerDropDown()}</div>
                    </div>
                   
                </form>
            </div>
            {elems}
            {notification}
        </>
    }

    renderConnectionHistory(){

        if(this.state.mode !== 1) return null;

        const loading = (this.state.bLoadingConnections) ? <Loading/> : null;
        
        if(loading === null && this.state.connectionError === null && this.state.connectionHistory === null) return null;

        const notification = (this.state.connectionError === null) ? null :
        <Notification type="error" displayUntil={this.state.connectionErrorDisplayUntil}>{this.state.connectionError}</Notification>

        let elems = [];

        if(this.state.connectionHistory !== null){

            const rows = [];

            for(let i = 0; i < this.state.connectionHistory.data.length; i++){

                const c = this.state.connectionHistory.data[i];

                rows.push(<tr key={i}>
                    <td><Link href={`/match/${c.match_id}`}>{c.match_id}</Link></td>
                    <td>{Functions.convertTimestamp(c.match_date, true)}</td>
                    <td className="pointer" onClick={(() =>{
                        this.changeIpSearch(c.ip)
                    })}>{c.ip}</td>
                    <td>{Functions.toHours(c.playtime)} Hours</td>
                </tr>);

            }

            elems = <>
                <div className="form m-bottom-25">
                    <div className="form-info">
                        Connection history for the profile <b>{this.state.selectedName}</b>
                    </div>
                </div>
                <BasicPageSelect width={1} results={this.state.connectionHistory.totalConnections ?? 0}
                    perPage={10} page={this.state.connectionPage} changePage={this.changeConnectionPage}
                />
                <Table2 width={1}>
                    <tr>
                        <th>Match ID</th>
                        <th>Date</th>
                        <th>IP</th>
                        <th>Playtime</th>
                    </tr>
                    {rows}
                </Table2>
            </>
        }

        return <>
            <div className="default-header">
                Connection History
            </div>
            {loading}
            {elems}
            {notification}
        </>
    }

    render(){

        return <div>
            <div className="default-header" id="player-search">Player Search</div>
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
            {this.renderPlayerHistory()}
            {this.renderIPHistory()}
            {this.renderConnectionHistory()}

        </div>
    }
}

export default AdminPlayerSearch;