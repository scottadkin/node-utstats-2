import DefaultHead from "../components/defaulthead";
import Nav from "../components/Nav/";
import Footer from "../components/Footer/";
import Players from "../api/players";
import Functions from "../api/functions";
import Pagination from "../components/Pagination/";
import React from "react";
import Link from "next/link";
import Session from "../api/session";
import SiteSettings from "../api/sitesettings";
import Analytics from "../api/analytics";
import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import Table2 from "../components/Table2";
import CountryFlag from "../components/CountryFlag";
import CTFCapRecords from "../components/CTFCapRecords";

class Records extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": 2, 
            "loaded": false, 
            "error": null, 
            "type": this.props.type, 
            "perPage": this.props.perPage,
            "totalResults": 0
        };

        this.changeType = this.changeType.bind(this);
        this.changePerPage = this.changePerPage.bind(this);
    }

    changeType(e){

        this.setState({"type": e.target.value});
    }

    changePerPage(e){

        this.setState({"perPage": e.target.value});
    }


    async loadData(){

        let mode = this.props.mode;
        let url = "/api/records";

        if(mode === 0){
            mode = "totals";
        }else if(mode === 1){
            mode = "match";
        }else if(mode === 2){
            mode = "maprecords";
            url = "/api/ctf";
        }else if(mode === 3){
            mode = "combogib";
        }

        const req = await fetch(url,{
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": mode, "type": this.state.type, "page": this.props.page - 1, "perPage": this.state.perPage})
        });

        const res = await req.json();

        if(res.error !== undefined){
            this.setState({"error": res.error});
        }else{
            console.log(res);
            this.setState({"data": res.data, "totalResults": res.totalResults});
        }
        
        
        this.setState({"loaded": true});
    }

    async componentDidMount(){

        await this.loadData();
    }

    async componentDidUpdate(prevProps){

        if(prevProps.mode !== this.props.mode || 
            prevProps.type !== this.props.type || 
            prevProps.page !== this.props.page ||
            prevProps.perPage !== this.props.perPage
        ){

            if(prevProps.mode !== this.props.mode){
                this.setState({"data": null, "loaded": false, "error": null});
            }
            await this.loadData();
        }
    }


    renderTotalOptions(){

        if(this.props.mode > 1) return null;
        
        const types = [];

        if(this.props.mode === 0) types.push(...this.props.validTypes.totals);
        if(this.props.mode === 1) types.push(...this.props.validTypes.matches);
        
        types.sort((a, b) =>{

            a = a.display.toLowerCase();
            b = b.display.toLowerCase();

            if(a < b){
                return -1;
            }else if(a > b){
                return 1;
            }

            return 0;
        });

        const options = [];

        for(let i = 0; i < types.length; i++){

            const {type, display} = types[i];

            options.push(<option key={type} value={type}>{display}</option>);
        }

        return <div>
            <div className="default-sub-header">Select Record Type</div>
                <div className="form">     
                <div className="select-row">
                    <div className="select-label">Record Type</div>
                    <select value={this.state.type} onChange={this.changeType}  className="default-select">
                        {options}
                    </select>
                </div>
                <div className="select-row">
                    <div className="select-label">Results Per Page</div>
                    <select value={this.props.perPage} onChange={this.changePerPage} className="default-select">
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="75">75</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <Link href={`/records/?mode=${this.props.mode}&type=${this.state.type}&page=1&pp=${this.state.perPage}`}>
                    <a>
                        <div className="search-button">Search</div>
                    </a>
                </Link>
            </div>
        </div>
    }


    getTypeTitle(){

        let types = [];

        if(this.props.mode === 0){
            types = this.props.validTypes.totals;
        }else if(this.props.mode === 1){
            types = this.props.validTypes.matches;
        }

        for(let i = 0; i < types.length; i++){

            const {type, display} = types[i];

            if(type === this.props.type) return display;
        }

        return "Unknown type";

    }


    renderTable(){

        if(this.props.mode >= 2) return null;

        const type = this.getTypeTitle();
        let title = type;

        if(this.props.mode === 0){
            title = `Player Total Records For ${title}`;
        }else if(this.props.mode === 1){
            title = `Player Match Records For ${title}`;
        }


        const hours = ["flag_carry_time", "playtime"];

        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];


            let playerURL = "";

            if(this.props.mode === 0){
                playerURL = `/player/${d.player_id}`;
            }else if(this.props.mode === 1){
                playerURL = `/pmatch/${d.match_id}/?player=${d.player_id}`;
            }


            let place = 1 + i + ((this.props.page - 1) * this.state.perPage);
            rows.push(<tr key={`${i}-${d.value}-${d.player_id}`}>
                <td>
                <span className="small-font yellow">
                        {place}{Functions.getOrdinal(place)}
                    </span>&nbsp;
                </td>
                <td className="text-left">
                    <Link href={playerURL}>
                        <a>
                            <CountryFlag country={d.country}/>
                            {d.name}
                        </a>
                    </Link>
                </td>
                <td className="small-font grey">{Functions.convertTimestamp((this.props.mode === 0) ? d.last : d.match_date, true, false)}</td>
                <td>{(this.props.mode === 0) ? d.matches : <Link href={`/map/${d.map_id}`}><a>{d.mapName}</a></Link>}</td>
                <td>{Functions.toHours(d.playtime)} Hours</td>
                <td>{(hours.indexOf(this.props.type) === -1) ? d.value : `${Functions.toHours(d.value)} Hours`}</td>
            </tr>);
        }

        return <div className="m-top-25">
            <Table2 width={1} header={title}>
                <tr>
                    <th>Place</th>
                    <th>Player</th>
                    <th>{(this.props.mode === 0) ? "Last Seen" : "Date" }</th>
                    <th>{(this.props.mode === 0) ? "Matches" : "Map" }</th>
                    <th>Playtime</th>
                    <th>{type}</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    renderPagination(){

        return <Pagination url={`/records/?mode=${this.props.mode}&pp=${this.state.perPage}&page=`} results={this.state.totalResults} 
            currentPage={this.props.page} perPage={this.props.perPage}
        />  
    }


    renderCTFCapRecords(){

        if(this.props.mode !== 2) return null;
        return <CTFCapRecords />;
    }

    renderElems(){

        if(this.state.error !== null) return <ErrorMessage title="Records" text={this.state.error}/>
        if(!this.state.loaded) return <Loading/>;

        return <div>
            <div className="tabs">
                <Link href={`/records/?mode=0&page=1&pp=${this.state.perPage}`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 0) ? "tab-selected" : ""}`}>Player Total Records</div>
                    </a>
                </Link>
                <Link href={`/records/?mode=1&page=1&pp=${this.state.perPage}`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 1) ? "tab-selected" : ""}`}>Player Match Records</div>
                    </a>
                </Link>
                <Link href={`/records/?mode=2&page=1&pp=${this.state.perPage}`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 2) ? "tab-selected" : ""}`}>CTF Cap Records</div>
                    </a>
                </Link>
                <Link href={`/records/?mode=3&page=1&pp=${this.state.perPage}`}>
                    <a>
                        <div className={`tab ${(this.props.mode === 3) ? "tab-selected" : ""}`}>Combogib Records</div>
                    </a>
                </Link>
            </div>
            {this.renderTotalOptions()}
            {this.renderPagination()}
            {this.renderTable()}
            {this.renderCTFCapRecords()}
            {this.renderPagination()}    
        </div>
    }

    getTitle(){

        const m = this.props.mode;

        if(m === 0) return `${this.getTypeTitle()} - Player Total Records`;
        if(m === 1) return `${this.getTypeTitle()} - Player Match Records`;
        if(m === 2) return `${this.getTypeTitle()} - CTF Cap Records`;
        if(m === 3) return `${this.getTypeTitle()} - Combogib Records`;

        return "Unknown";
    }

    render(){


        return <div>
            <DefaultHead 
            title={this.getTitle()} 
            description={`records descp`} 
            host={this.props.host}
            keywords={`${this.getTypeTitle().replaceAll(" ",",").toLowerCase()},player,record`}/>
            <main>
                <Nav settings={this.props.navSettings} session={this.props.session}/>
                <div id="content">
                    <div className="default">
                        <div className="default-header">Records</div>
                        {this.renderElems()}
                    </div>
                </div>
                <Footer session={this.props.session}/>
            </main>
        </div>
    }
}

export async function getServerSideProps({req, query}){

    const session = new Session(req);
	await session.load();

    let mode = parseInt(query.mode) ?? 0;
    if(mode !== mode) mode = 0;

    let page = parseInt(query.page) ?? 1;
    if(page !== page) page = 1;

    let type = query.type ?? "kills";

    let perPage = parseInt(query.pp) ?? 25;
    if(perPage !== perPage) perPage = 25;

    const settings = new SiteSettings();
    const navSettings = await settings.getCategorySettings("Navigation");
    const pageSettings = await settings.getCategorySettings("Records Page");

    const playerManager = new Players();
    const validTypes = playerManager.getValidRecordTypes();

    await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);

    return {
        "props": {
            "host": req.headers.host,
            "mode": mode,
            "page": page,
            "type": type.toLowerCase(),
            "perPage": perPage,
            "validTypes": validTypes,
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings),
            "pageSettings": JSON.stringify(pageSettings)
        }
    }
}

export default Records;