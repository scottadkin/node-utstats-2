import React from 'react';
import ACE from '../../api/ace';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';
import Table2 from '../Table2';

class ACEPlayerReport extends React.Component{

    constructor(props){

        super(props);
        this.state = {
            "basicData": [], 
            "aliases": [],
            "joinsPage": 0, 
            "joinsData": [], 
            "joinsResult": 0, 
            "joinPages": 0,
            "kickPage": 0,
            "kickPages": 0,
            "kickResult": 0,
            "kickData": [],
            "sshotPage": 0,
            "sshotPages": 0,
            "sshotResult": 0,
            "sshotData": [],
            "aliasMode": 0,
            "uniqueVariables": []
        };

        this.previous = this.previous.bind(this);
        this.next = this.next.bind(this);
        this.nextKicks = this.nextKicks.bind(this);
        this.previousKicks = this.previousKicks.bind(this);
        this.nextSShots = this.nextSShots.bind(this);
        this.previousSShots = this.previousSShots.bind(this);
        this.changeAliasMode = this.changeAliasMode.bind(this);

    }

    changeAliasMode(id){
        this.setState({"aliasMode": id});
    }

    async nextSShots(){

        if(this.state.sshotPage < this.state.sshotPages - 1){

            const page = this.state.sshotPage + 1;
  
            this.setState({"sshotPage": page});
            await this.loadScreenshotRequests(page);
        }
    }

    async previousSShots(){

        if(this.state.sshotPage > 0){

            const page = this.state.sshotPage - 1;

            this.setState({"sshotPage": page});
            await this.loadScreenshotRequests(page);
        }
    }

    async nextKicks(){

        if(this.state.kickPage < this.state.kickPages - 1){

            const page = this.state.kickPage + 1;
  
            this.setState({"kickPage": page});
            await this.loadKickLogs(page);
        }
    }

    async previousKicks(){

        if(this.state.kickPage > 0){

            const page = this.state.kickPage - 1;
            this.setState({"kickPage": page});
            await this.loadKickLogs(page);
        }
    }

    async previous(){

        if(this.state.joinsPage > 0){

            const page = this.state.joinsPage - 1;
            this.setState({"joinsPage": page});
            await this.loadPlayerJoins(page);
        }
    }

    async next(){

        if(this.state.joinsPage < this.state.joinPages - 1){

            const page = this.state.joinsPage + 1;

            this.setState({"joinsPage": page});
            await this.loadPlayerJoins(page);
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

                if(res.playerData.length > 0){

                    res.playerData.sort((a, b) =>{

                        a = a.last;
                        b = b.last;

                        return b-a;
                    });
                }

                this.setState({
                    "basicData": res.playerData,
                    "aliases": res.aliases,
                    "uniqueVariables": res.uniqueVariables
                });
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
                "body": JSON.stringify({"mode": "player-joins", "name": this.props.name, "page": page, "perPage": 10})
            });

            const res = await req.json();

            if(res.error === undefined){

                const pages = (res.results > 0) ? Math.ceil(res.results / 10) : 1;

                this.setState({"joinsData": res.data, "joinsResult": res.results, "joinPages": pages});
            }

        }catch(err){
            console.trace(err);
        }
    }

    async loadKickLogs(page){

        try{

            if(this.props.name === "") return;

            if(page < 0) page = 0;


            const req = await fetch("/api/ace", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "player-kicks", "name": this.props.name, "page": page})
            });

            const res = await req.json();

            if(res.error === undefined){

                const pages = (res.results > 0) ? Math.ceil(res.results / 10) : 1;

                this.setState({"kickData": res.data, "kickResult": res.results, "kickPages": pages});
            }

        }catch(err){
            console.trace(err);
        }
    }

    async loadScreenshotRequests(page){

        try{

            const perPage = 10;

            const req = await fetch("/api/ace", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "player-sshots", "name": this.props.name, "page": page})
            });

            const res = await req.json();

            if(res.error === undefined){

                const pages = (res.results > 0) ? Math.ceil(res.results / perPage) : 0;

                this.setState({
                    "sshotPage": page,
                    "sshotPages": pages,
                    "sshotResult": res.results,
                    "sshotData": res.data
                });
            }

        }catch(err){
            console.trace(err);
        }
    }

    async loadDefault(){

        if(this.props.name !== ""){

            await this.loadPlayerInfo();
            await this.loadPlayerJoins(0);
            await this.loadKickLogs(0);
            await this.loadScreenshotRequests(0);
        }
    }

    async componentDidMount(){

        await this.loadDefault();
    }

    async componentDidUpdate(prevProps){

        if(this.props.name !== prevProps.name){
            this.loadDefault();
        }
    }

    renderBasicData(){

        const rows = [];

        const cleanedData = [];

        const getHardwareIndex = (mac1, mac2, hwid) =>{

            for(let i = 0; i < cleanedData.length; i++){

                const c = cleanedData[i];

                if(c.mac1 === mac1 && c.mac2 === mac2 && c.hwid === hwid){
                    return i;
                }
            }

            return -1;
        }

        for(let i = 0; i < this.state.basicData.length; i++){

            const d = this.state.basicData[i];

            let index = getHardwareIndex(d.mac1, d.mac2, d.hwid);

            if(index === -1){
                
                cleanedData.push({
                    "hwid": d.hwid,
                    "mac1": d.mac1,
                    "mac2": d.mac2,
                    "first": d.first,
                    "last": d.last,
                    "times_connected": d.times_connected,
                    "times_kicked": d.times_kicked,
                    "ips_used": 1
                });

            }else{

                const current = cleanedData[index];

                current.times_connected += d.times_connected;
                current.times_kicked += d.times_kicked;
                current.ips_used++;
                if(current.first > d.first) current.first = d.first;
                if(current.last < d.last) current.last = d.last;
            }
        }

        for(let i = 0; i < cleanedData.length; i++){

            const d = cleanedData[i];

            rows.push(<tr key={i}>
                <td>
                    <Link href={`/ace?mode=players&hwid=${d.hwid}`}><span className="yellow">HWID: </span> {d.hwid}</Link><br/>
                    <Link href={`/ace?mode=players&mac1=${d.mac1}`}><span className="yellow">MAC1: </span> {d.mac1}</Link><br/>
                    <Link href={`/ace?mode=players&mac2=${d.mac2}`}><span className="yellow">MAC2: </span> {d.mac2}</Link>
                </td>
                <td>{d.ips_used}</td>
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

        if(rows.length === 0){
            rows.push(<tr key="0"><td colSpan="5">None</td></tr>);
        }

        return <div className="m-bottom-25">
            <div className="default-sub-header">Basic Summary</div>

            <Table2 width={1}>
                <tr>
                    <th>Hardware Info</th>
                    <th>Unique IPs</th>
                    <th>Dates</th>
                    <th>Times Connected</th>
                    <th>Times Kicked</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    renderJoins(){

        const rows = [];

        for(let i = 0; i < this.state.joinsData.length; i++){

            const d = this.state.joinsData[i];

            rows.push(<tr key={i}>
                <td>{d.ace_version}</td>
                <td>{Functions.convertTimestamp(d.timestamp, true)}</td>
                <td><Link href={`/ace?mode=players&ip=${d.ip}`}><CountryFlag host={this.props.host} country={d.country}/>{d.ip}</Link></td>
                <td>{d.os}</td>
                <td>
                    <Link href={`/ace?mode=players&hwid=${d.hwid}`}><span className="yellow">HWID:</span> {d.hwid}</Link><br/>
                    <Link href={`/ace?mode=players&mac1=${d.mac1}`}><span className="yellow">MAC1:</span> {d.mac1}</Link><br/>
                    <Link href={`/ace?mode=players&mac2=${d.mac2}`}><span className="yellow">MAC2:</span> {d.mac2}</Link><br/>
                </td>
            </tr>);
        }

        if(rows.length === 0){
            rows.push(<tr key="0"><td colSpan="5">None</td></tr>);
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
            <Table2 width={1}>
                <tr>
                    <th>ACE</th>
                    <th>Date</th>
                    <th>IP</th>
                    <th>OS</th>
                    <th>Hardware Info</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    renderKickLogs(){

        const rows = [];

        for(let i = 0; i < this.state.kickData.length; i++){

            const d = this.state.kickData[i];

            rows.push(<tr key={i}>
                <td>{Functions.convertTimestamp(d.timestamp, true)}</td>
                <td>
                    <Link href={`/ace?mode=players&ip=${d.ip}`}><CountryFlag host={this.props.host} country={d.country}/>{d.ip}</Link>
                </td>
                <td>
                    <Link href={`/ace?mode=players&hwid=${d.hwid}`}><span className="yellow">HWID:</span> {d.hwid}</Link><br/>
                    <Link href={`/ace?mode=players&mac1=${d.mac1}`}><span className="yellow">MAC1:</span> {d.mac1}</Link><br/>
                    <Link href={`/ace?mode=players&mac2=${d.mac2}`}><span className="yellow">MAC2:</span> {d.mac2}</Link>
                </td>
                <td>{d.kick_reason}</td>
                <td>
                     {d.package_name}<br/>
                     {d.package_version}
                </td>
                <td>
                    <a href={ACE.cleanImageURL(d.screenshot_file)} rel="noreferrer" target="_blank">View</a>
                </td>
            </tr>);
        }

        if(rows.length === 0){
            rows.push(<tr key="0"><td colSpan="6">None</td></tr>);
        }

        return <div className="m-bottom-25">
            <div className="default-sub-header">Kick Logs</div>
            <div className="simple-pagination">
                <div onClick={this.previousKicks}>Previous</div>
                <div>
                    <span className="yellow">Viewing Page {this.state.kickPage + 1} of {this.state.kickPages}</span><br/>
                    Total Results {this.state.kickResult}
                </div>
                <div onClick={this.nextKicks}>Next</div>
            </div>
            <Table2 width={1}>
                <tr>
                    <th>Date</th>
                    <th>IP</th>
                    <th>Hardware Info</th>
                    <th>Kick Reason</th>
                    <th>Package Info</th>
                    <th>Screenshot</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    renderScreenshotRequests(){

        const rows = [];

        for(let i = 0; i < this.state.sshotData.length; i++){

            const d = this.state.sshotData[i];

            rows.push(<tr key={i}>
                <td>{Functions.convertTimestamp(d.timestamp, true)}</td>
                <td><Link href={`/ace?mode=players&ip=${d.ip}`}><CountryFlag host={this.props.host} country={d.country}/>{d.ip}</Link></td>
                <td>
                    <Link href={`/ace?mode=players&hwid=${d.hwid}`}><span className="yellow">HWID: </span> {d.hwid}</Link><br/>
                    <Link href={`/ace?mode=players&mac1=${d.mac1}`}><span className="yellow">MAC1: </span> {d.mac1}</Link><br/>
                    <Link href={`/ace?mode=players&mac2=${d.mac2}`}><span className="yellow">MAC2: </span> {d.mac2}</Link>
                </td>
                <td>{d.admin_name}</td>
                <td><a href={ACE.cleanImageURL(d.screenshot_file)} rel="noreferrer" target="_blank">View</a></td>
            </tr>);
        }

        if(rows.length === 0){
            rows.push(<tr key="0"><td colSpan="6">None</td></tr>);
        }

        return <div className="m-bottom-25">
            <div className="default-sub-header">Screenshot Requests</div>
            <div className="simple-pagination">
                <div onClick={this.previousSShots}>Previous</div>
                <div>
                    <span className="yellow">Viewing Page {this.state.sshotPage + 1} of {this.state.sshotPages}</span><br/>
                    Total Results {this.state.sshotResult}
                </div>
                <div onClick={this.nextSShots}>Next</div>
            </div>
            <Table2 width={1}>
                <tr>
                    <th>Date</th>
                    <th>IP</th>
                    <th>Hardware Info</th>
                    <th>Requested By</th>
                    <th>Screenshot</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    renderAliases(){

        const elems = [];

        const ipMatches = [];
        const dualMacMatches = [];
        const mac1Matches = [];
        const mac2Matches = [];
        const hwidMatches = [];
        const hardwareMatches = [];
        const exactMatches = [];

        for(let i = 0; i < this.state.aliases.length; i++){

            const a = this.state.aliases[i];

            for(let x = 0; x < this.state.basicData.length; x++){

                const p = this.state.basicData[x];

                if(a.ip === p.ip){
                    if(ipMatches.indexOf(a.name) === -1) ipMatches.push(a.name);
                }

                if(a.mac1 === p.mac1){
                    if(mac1Matches.indexOf(a.name) === -1) mac1Matches.push(a.name);
                }

                if(a.mac2 === p.mac2){
                    if(mac2Matches.indexOf(a.name) === -1) mac2Matches.push(a.name);
                }

                if(a.mac1 === p.mac1 && a.mac2 === p.mac2){
                    if(dualMacMatches.indexOf(a.name) === -1) dualMacMatches.push(a.name);
                }

                if(a.hwid === p.hwid){
                    if(hwidMatches.indexOf(a.name) === -1) hwidMatches.push(a.name);
                }

                if(a.mac1 === p.mac1 && a.mac2 === p.mac2 && a.hwid === p.hwid){

                    if(hardwareMatches.indexOf(a.name) === -1) hardwareMatches.push(a.name);

                    if(a.ip === p.ip){
                        if(exactMatches.indexOf(a.name) === -1) exactMatches.push(a.name);
                    }
                }
            }
        }

        let data = [];

        const mode = this.state.aliasMode;

        if(mode === 0) data = exactMatches;
        if(mode === 1) data = hardwareMatches;
        if(mode === 2) data = dualMacMatches;
        if(mode === 3) data = mac1Matches;
        if(mode === 4) data = mac2Matches;
        if(mode === 5) data = ipMatches;


        const rows = [];

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            rows.push(
                <tr key={i}>
                    <td>
                    <Link href={`/ace/?mode=player&name=${d}`}>    
                        <CountryFlag host={this.props.host} country={"xx"}/>{d}               
                    </Link>
                    </td>
                </tr>
            );
        }
        
        if(rows.length === 0){
            rows.push(<tr key="0"><td>No Data</td></tr>);
        }

        return <div className="m-bottom-25">
            
            <div className="default-sub-header">Aliases</div>
            <div className="tabs">
                <div className={`tab ${(this.state.aliasMode === 0) ? "tab-selected" : ""}`} onClick={(() =>{

                    this.changeAliasMode(0);
          
                })}>
                    Exact Matches
                </div>
                <div className={`tab ${(this.state.aliasMode === 1) ? "tab-selected" : ""}`} onClick={(() =>{

                    this.changeAliasMode(1);
          
                })}>
                    Hardware Matches
                </div>
                <div className={`tab ${(this.state.aliasMode === 2) ? "tab-selected" : ""}`}  onClick={(() =>{

                    this.changeAliasMode(2);
          
                })}>
                    Mac1 &amp; Mac2 Matches
                </div>
                <div className={`tab ${(this.state.aliasMode === 3) ? "tab-selected" : ""}`}  onClick={(() =>{

                    this.changeAliasMode(3);
          
                })}>
                    Mac1 Matches
                </div>
                <div className={`tab ${(this.state.aliasMode === 4) ? "tab-selected" : ""}`} onClick={(() =>{

                    this.changeAliasMode(4);
          
                })}>
                    Mac2 Matches
                </div>
                <div className={`tab ${(this.state.aliasMode === 5) ? "tab-selected" : ""}`} onClick={(() =>{

                    this.changeAliasMode(5);
          
                })}>
                    IP Matches
                </div>
            </div>
     
            <Table2 width={3} players={true}>
                <tr>
                    <th>Name</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    renderIps(){


        const ips = {};

        for(let i = 0; i < this.state.basicData.length; i++){

            const d = this.state.basicData[i];

            if(ips[d.ip] === undefined){

                ips[d.ip] = {
                    "first": d.first,
                    "last": d.last,
                    "times_connected": d.times_connected,
                    "times_kicked": d.times_kicked,
                    "country": d.country
                }
            }else{

                const c = ips[d.ip];

                if(c.first > d.first) c.first = d.first;
                if(c.last < d.last) c.last = d.last;
                c.times_connected += d.times_connected;
                c.times_kicked += d.times_kicked;
            }
        }

        const rows = [];
        
        for(const [key, value] of Object.entries(ips)){

            rows.push(<tr key={key}>
                <td><Link href={`/ace?mode=players&ip=${key}`}><CountryFlag host={this.props.host} country={value.country}/>{key}</Link></td>
                <td>{value.times_connected}</td>
                <td>{Functions.convertTimestamp(value.first, true)}</td>
                <td>{Functions.convertTimestamp(value.last, true)}</td>
                <td>{value.times_kicked}</td>
            </tr>);
        }

        return <div className="m-bottom-25">
            <div className="default-sub-header">Used IPS</div>
            <Table2 width={1}>
                <tr>
                    <th>IP</th>
                    <th>Times Connected</th>
                    <th>First Used</th>
                    <th>Last Used</th>
                    <th>Times Kicked</th>
                </tr>
                {rows}
            </Table2>
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

            {this.renderAliases()}
            {this.renderBasicData()}
            {this.renderIps()}
            {this.renderScreenshotRequests()}
            {this.renderKickLogs()}
            {this.renderJoins()}
            
        </div>
    }
}

export default ACEPlayerReport;