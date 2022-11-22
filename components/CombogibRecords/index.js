import React from "react";
import Loading from "../Loading";
import Option2Alt from "../Option2Alt";
import ErrorMessage from "../ErrorMessage";
import Link from "next/link";
import Table2 from "../Table2";
import CountryFlag from "../CountryFlag";
import Functions from "../../api/functions";
import Pagination from "../Pagination";
import Playtime from "../Playtime";


class CombogibRecords extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "loaded": false, "error": null, "validTypes": null,
            "perPage": this.props.perPage, "recordType": this.props.type,
            "data": null,
            "totalResults": null
        };

        this.changePerPage = this.changePerPage.bind(this);
        this.changeRecordType = this.changeRecordType.bind(this);
    }

    changePerPage(e){

        this.setState({"perPage": e.target.value});
    }

    changeRecordType(e){

        this.setState({"recordType": e.target.value});
    }



    async componentDidMount(){
        
        await this.loadData();
    }

    async componentDidUpdate(prevProps){

        if(prevProps.type !== this.props.type || this.props.page !== prevProps.page || this.props.mode !== prevProps.mode
            || this.props.perPage !== prevProps.perPage){

                if(this.props.mode !== prevProps.mode){
                    this.setState({"data": null, "loaded": false, "totalResults": null});
                }
            await this.loadData();
        }
    }

    bValidType(){

        const types = (this.props.mode === 0) ? this.props.validTypes.match : this.props.validTypes.totals;

        const result = types.find((entry) =>{
            return entry.name === this.state.recordType;
        });

        if(result === undefined) return false;
        return true;
    }


    async loadTotalResults(){


        const req = await fetch("/api/combogib", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": (this.props.mode === 0) ? "totalmatchrecords" : "totalplayerrecords"})
        });

        const res = await req.json();

        if(res.error !== undefined){
            this.setState({"error": res.error, "data": null, "totalResults": 0});
        }else{

            this.setState({"totalResults": res.results});
        }
    }

    async loadData(){

        this.setState({"error": null});

        await this.loadTotalResults();

        const mode = (this.props.mode === 0) ? "matchrecords" : "totalrecords";

        const bValidType = this.bValidType();

        if(!bValidType){

            this.setState({"loaded": true, "error": `${this.state.recordType} is not a valid record type.`});
            return;
        }

        const req = await fetch("/api/combogib", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({
                "mode": mode, 
                "type": this.state.recordType.toLowerCase(), 
                "page": this.props.page - 1,
                "perPage": parseInt(this.state.perPage)
            })
        });

        const res = await req.json();

        if(res.error !== undefined){

            this.setState({"error": res.error, "data": null});
        }else{
            this.setState({"data": res.data});
        }

        this.setState({"loaded": true});

    }

    renderOptions(){


        if(this.props.validTypes === null) return null;

        const options = [];
        const data = (this.props.mode === 0) ? [...this.props.validTypes.match] : [...this.props.validTypes.totals];

        data.sort((a, b) =>{

            a = a.display.toLowerCase();
            b = b.display.toLowerCase();

            if(a < b) return -1;
            if(a > b) return 1;
            return 0;
        });


        for(let i = 0; i < data.length; i++){

            const {name, display} = data[i];
            options.push(<option key={name} value={name}>{display}</option>);
        }

        return <select className="default-select" value={this.state.recordType} onChange={this.changeRecordType}>
            {options}
        </select>
    }

    renderMatchTable(){

        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const {player, date, value, playtime, map} = this.state.data[i];

            const matchId = this.state.data[i].match_id;
            const mapId = this.state.data[i].map_id;

            const place = i + 1 + ((this.props.page - 1) * this.state.perPage);

            rows.push(<tr key={i}>
                <td className="place">{place}{Functions.getOrdinal(place)}</td>
                <td className="text-left">
                    <Link href={`/pmatch/${matchId}/?player=${player.id}`}>
                        <a>
                            <CountryFlag country={player.country}/>{player.name}
                        </a>
                    </Link>
                </td>
                <td className="small-font grey">
                    <Link href={`/match/${matchId}/`}>
                        <a>
                            {Functions.convertTimestamp(date,true)}
                        </a>
                    </Link>
                </td>
                <td>
                    <Link href={`/map/${mapId}/`}>
                        <a>
                            {map}
                        </a>
                    </Link>                
                </td>
                <td className="playtime"><Playtime timestamp={playtime} /></td>
                <td>{value}</td>
            </tr>);
        }

        return <div>
            <Table2 header={this.getTitle()} width={1}>
                <tr>
                    <th>Place</th>
                    <th>Player</th>
                    <th>Date</th>
                    <th>Map</th>
                    <th>Playtime</th>
                    <th>Value</th>
                </tr>
                {rows}
            </Table2>
        </div>
    }

    renderPlayerTable(){

        const rows = [];

        for(let i = 0; i < this.state.data.length; i++){

            const d = this.state.data[i];

            const place = i + 1 + ((this.props.page - 1) * this.props.perPage);

            rows.push(<tr key={`${d.player_id}-${i}`}>
                <td className="place">{place}{Functions.getOrdinal(place)}</td>
                <td className="text-left">
                    <CountryFlag country={d.player.country}/>{d.player.name}
                </td>
                <td>{d.total_matches}</td>
                <td className="playtime"><Playtime timestamp={d.playtime}/></td>
                <td>{d.value}</td>
            </tr>);
        }

        return <Table2 header={this.getTitle()} width={4}>
            <tr>
                <th>Place</th>
                <th>Player</th>
                <th>Matches</th>
                <th>Playtime</th>
                <th>Value</th>
            </tr>
            {rows}
        </Table2>
    }

    renderData(){

        if(!this.state.loaded) return null;
        if(this.state.data === null) return null;

        if(this.props.mode === 0) return this.renderMatchTable();
        if(this.props.mode === 1) return this.renderPlayerTable();
        
    }


    getTitle(){

        if(this.props.validTypes === null) return "";

        const key = (this.props.mode === 0) ? "match" : "totals";

        for(let i = 0; i < this.props.validTypes[key].length; i++){

            const {name, display} = this.props.validTypes[key][i];
            if(this.props.type === name) return display;
        }

        return "Not Found";
    }

    render(){

        const pagination = (!this.state.loaded) ? null : <Pagination 
            url={`/records/?mode=3&type=${this.state.recordType}&cm=${this.props.mode}&pp=${this.props.perPage}&page=`}
            currentPage={this.props.page}
            perPage={this.props.perPage}
            results={(this.state.totalResults !== null) ? this.state.totalResults : 0}
            
        />

        return <div>
            <div className="default-sub-header">Select Record Type</div>
            <div className="form m-bottom-25">
                <div className="select-row">
                    <div className="select-label">Record Mode</div>
                    <Option2Alt 
                        url1={`/records/?mode=3&cm=0&type=${this.state.recordType}&page=1&pp=${this.state.perPage}`} title1="Single Match" 
                        url2={`/records/?mode=3&cm=1&type=${this.state.recordType}&page=1&pp=${this.state.perPage}`} title2="Player Totals" 
                        value={this.props.mode}
                    />
                </div>
                <div className="select-row">
                    <div className="select-label">Record Type</div>
                    {this.renderOptions()}
                </div>
                <div className="select-row">
                    <div className="select-label">Results Per Page</div>
                    <select value={this.state.perPage} onChange={this.changePerPage} className="default-select">
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="75">75</option>
                        <option value="100">100</option>
                    </select>
                </div>
                <Link href={`/records/?mode=3&cm=${this.props.mode}&type=${this.state.recordType}&page=1&pp=${this.state.perPage}`}>
                    <a>
                        <div className="search-button">Search</div>
                    </a>
                </Link>
            </div>
            <Loading value={this.state.loaded}/>
            <ErrorMessage title="CombogibRecords" text={this.state.error}/>
            {pagination}
            {this.renderData()}
            {pagination}
        </div>
    }
}

export default CombogibRecords;