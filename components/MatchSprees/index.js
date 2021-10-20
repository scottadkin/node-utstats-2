import React from 'react';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import BasicPageSelect from '../BasicPageSelect';

class MatchSprees extends React.Component{

    constructor(props){

        super(props);
        this.state = {"page": 0, "perPage": 10, "data": []};

        this.changePage = this.changePage.bind(this);
    }

    async loadData(){

        try{

            const playerId = (this.props.playerId !== undefined) ? this.props.playerId : -1;

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "sprees", "matchId": this.props.matchId, "playerId": playerId})
            });

            const res = await req.json();

            if(res.error === undefined){
                this.setState({"data": res.data});
            }else{

                throw new Error(res.error);
            }

        }catch(err){
            console.trace(err);
        }
    }

    async componentDidMount(){

        await this.loadData();
    }

    changePage(page){

        if(page < 0) page = 0;

        const maxPage = Math.ceil(this.state.data.length / this.state.perPage) - 1;

        if(page > maxPage){
            page = maxPage;
        }

        this.setState({"page": page});
    }

    renderTable(){

        const rows = [];

        const start = this.state.page * this.state.perPage;

        const end = (start + this.state.perPage > this.state.data.length) ? this.state.data.length : start + this.state.perPage;

        for(let i = start; i < end; i++){

            const d = this.state.data[i];

            const player = Functions.getPlayer(this.props.players, d.player);
            const killer = (d.killer !== -1) ? Functions.getPlayer(this.props.players, d.killer) : null;

            let killerElem = null;

            if(killer !== null){

                if(player.id !== killer.id){

                    killerElem = <td className="red">
                        Killed by <Link href={`/pmatch/${this.props.matchId}?player=${killer.id}`}>
                            <a><CountryFlag host={this.props.host} country={killer.country}/><span className="yellow">{killer.name}</span></a>
                        </Link>
                    </td>

                }else{

                    killerElem = <td className="red">
                        Killed their own dumb self.
                    </td>
                }
            }else{

                killerElem = <td>Match Ended!</td>;
            }


            rows.push(<tr key={i}>
                <td>
                    <Link href={`/pmatch/${this.props.matchId}?player=${player.id}`}>
                        <a>
                            <CountryFlag host={this.props.host} country={player.country}/>{player.name}
                        </a>
                    </Link>
                </td>
                <td>
                    {Functions.MMSS(d.start_timestamp)}
                </td>
                <td>
                    {Functions.MMSS(d.end_timestamp)}
                </td>
                <td>
                    {Functions.MMSS(d.total_time)}
                </td>
                {killerElem}
                <td>
                    {d.kills}
                </td>
            </tr>);
        }

        return <div>
            <table className="t-width-1 td-1-left">
                <tbody>
                    <tr>
                        <th>Player</th>
                        <th>Started</th>
                        <th>Ended</th>
                        <th>Spree Lifetime</th>
                        <th>End Reason</th>
                        <th>Total Kills</th>
                    </tr>
                    {rows}
                </tbody>
            </table>
        </div>
    }

    render(){

        if(this.state.data.length === 0) return null;
        
        return <div className="m-bottom-25">
            <div className="default-header">Extended Sprees Information</div>
            <BasicPageSelect page={this.state.page} perPage={this.state.perPage} results={this.state.data.length} changePage={this.changePage}/>
            {this.renderTable()}
        </div>
    }
}

export default MatchSprees;