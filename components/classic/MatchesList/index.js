import React from "react";
import Functions from '../../../api/functions';
import MatchResult from '../MatchResult';
import Link from 'next/link';
import MatchResultBox from '../../MatchResultBox';
import Option2 from '../../Option2';
import Pagination from '../../Pagination';


class MatchesList extends React.Component{

    constructor(props){

        super(props);

        this.state = {
            "mode": this.props.display,
            "gametype": this.props.gametype,
            "perPage": this.props.perPage,
            "page": this.props.page
        };

        this.changeMode = this.changeMode.bind(this);

        this.changePerPage = this.changePerPage.bind(this);
    }


    changePerPage(e){

        this.setState({"perPage": e.target.value});
    }

    changeMode(id){
        this.setState({"mode": id});
    }

    renderTable(){

        if(this.state.mode !== 1) return null;

        const elems = [];

        let d = 0;

        for(let i = 0; i < this.props.data.length; i++){

            d = this.props.data[i];

            elems.push(<tr key={i}>
                <td><Link href={`/classic/match/${d.id}`}><a>{Functions.convertTimestamp(Functions.utDate(d.time), true)}</a></Link></td>
                <td><Link href={`/classic/match/${d.id}`}><a>{d.gamename}</a></Link></td>
                <td><Link href={`/classic/match/${d.id}`}><a>{Functions.removeUnr(d.mapfile)}</a></Link></td>
                <td><Link href={`/classic/match/${d.id}`}><a>{Functions.MMSS(d.gametime)}</a></Link></td>
                <td><Link href={`/classic/match/${d.id}`}><a>{d.players}</a></Link></td>
                <td className="padding-0"><Link href={`/classic/match/${d.id}`}><a><MatchResult data={d.result}/></a></Link></td>
            </tr>);
        }

        if(elems.length === 0) return null;

        return <table className="t-width-1">
            <tbody>
                <tr>
                    <th>Date</th>
                    <th>Gametype</th>
                    <th>Map</th>
                    <th>Playtime</th>
                    <th>Players</th>
                    <th>Result</th>
                </tr>
                {elems}
            </tbody>
        </table>;

    }


    renderDefault(){

        if(this.state.mode !== 0) return null;

        const elems = [];

        let d = 0;

        for(let i = 0; i < this.props.data.length; i++){

            d = this.props.data[i];

            elems.push(
                <Link href={`/classic/match/${d.id}`}>
                    <a>
                        <MatchResultBox key={i} serverName={d.servername} gametypeName={d.gamename} mapName={Functions.removeUnr(d.mapfile)}
                        date={Functions.convertTimestamp(Functions.utDate(d.time))} playtime={Functions.MMSS(d.gametime)} players={d.players}
                        totalTeams={d.totalTeams} result={d.result} mapImage={d.image} classic={true}
                        />
                    </a>
                </Link>
            );
        }

        return elems;

    }


    createGametypesDropDown(){

        const options = [];

        for(const [key, value] of Object.entries(this.props.gametypes)){

            options.push(<option key={key} value={key}>{value}</option>);

        }

        return <select defaultValue={this.props.gametype} name="gametype" className="default-select">
            <option key={-1} value={0}>All</option>
            {options}
        </select>
    }

    render(){

        

        return <div>
            <div className="default-header">
                {this.props.title}
            </div>

            <div className="form">
                <form action="/classic/matches/" method="GET">
                    <div className="select-row">
                        <div className="select-label">Gametype</div>
                        <div>
                            {this.createGametypesDropDown()}
                        </div>
                    </div>
                    <div className="select-row">
                        <div className="select-label">Results Per Page</div>
                        <div>
                            <select name="perPage" defaultValue={this.props.perPage} className="default-select" onChange={this.changePerPage}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                    </div>
                    <div className="select-row">
                        <div className="select-label">Display</div>
                        <div>
                            <Option2 value={this.state.mode} title1="Default" title2="Table" changeEvent={this.changeMode}/>
                            <input type="hidden" name="display" value={this.state.mode}/>
                        </div>
                    </div>
                    <input type="submit" className="search-button" value="Search"/>
                </form>
            </div>
            <Pagination url={`/classic/matches/?display=${this.state.mode}&gametype=${this.state.gametype}&perPage=${this.state.perPage}&page=`}
                currentPage={this.props.page + 1} results={this.props.results} pages={this.props.pages} perPage={this.state.perPage}
            />
            {this.renderTable()}
            {this.renderDefault()}
            
        </div>
    }
}

export default MatchesList;