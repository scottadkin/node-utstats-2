import React from "react";
import Functions from '../../../api/functions';
import MatchResult from '../MatchResult';
import Link from 'next/link';
import MatchResultBox from '../../../components/MatchResultBox';
import Option2 from '../../../components/Option2';


class MatchesList extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": this.props.display};

        this.changeMode = this.changeMode.bind(this);
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

            elems.push(<MatchResultBox key={i} serverName={d.servername} gametypeName={d.gamename} mapName={Functions.removeUnr(d.mapfile)}
            date={Functions.convertTimestamp(Functions.utDate(d.time))} playtime={Functions.MMSS(d.gametime)} players={d.players}
            totalTeams={d.totalTeams} result={d.result} mapImage={d.image} classic={true}/>);
        }

        return elems;

    }


    createGametypesDropDown(){

        const options = [];

        let g = 0;

        for(let i = 0; i < this.props.gametypes.length; i++){

            g = this.props.gametypes[i];

            options.push(<option key={i} value={g.id}>{g.name}</option>);
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

            <div className="form m-bottom-25">
                <form action="/classic/" method="GET">
                    <div className="select-row">
                        <div className="select-label">Gametype</div>
                        <div>
                            {this.createGametypesDropDown()}
                        </div>
                    </div>
                    <div className="select-row">
                        <div className="select-label">Results Per Page</div>
                        <div>
                            <select name="perPage" defaultValue={this.props.perPage} className="default-select">
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
            {this.renderTable()}
            {this.renderDefault()}
            
        </div>
    }
}

export default MatchesList;