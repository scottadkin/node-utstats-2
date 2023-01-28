import {React, useEffect, useState} from 'react';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag/';
import Link from 'next/link';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import InteractiveTable from '../InteractiveTable';

const MatchSprees = ({matchId, players, matchStart}) =>{


    const [bLoading, setbLoading] = useState(true);
    const [sprees, setSprees] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            const req = await fetch("/api/match",{
                "signal": controller.signal,
                "headers": {
                    "Content-type": "application/json",
                },
                "method": "post",
                "body": JSON.stringify({
                    "mode": "sprees",
                    "matchId": matchId
                })
            });

            const res = await req.json();

            if(res.error !== undefined){
                setError(res.error);
            }else{
                setSprees(res.data);
            }

            setbLoading(false);
        }

        loadData();

        return () =>{
            controller.abort();
        }

    },[matchId]);


    const renderTable = () =>{

        const headers = {
            "player": "Player",
            "started": "Started",
            "ended": "Ended",
            "spreeTime": "Spree Lifetime",
            "reason": "End Reason",
            "kills": "Total Kills"
       
        };
        const data =[];

        for(let i = 0; i < sprees.length; i++){

            const s = sprees[i];

            const player = Functions.getPlayer(players, s.player, true);

            let endReason = null;

            if(s.killer === -1){
                endReason = <div>Match ended!</div>;
            }

            if(s.killer !== -1 && s.player !== s.killer){

                const killer = Functions.getPlayer(players, s.killer, true);
                endReason = <div><span className="red">Killed by</span> <CountryFlag country={killer.country}/>{killer.name}</div>
            }

            if(s.killer === s.player){
                endReason = <div className="red">Committed Suicide</div>
            }

            data.push({
                "player": {
                    "value": player.name.toLowerCase(), 
                    "displayValue": <Link href={`/pmatch/${matchId}/?player=${player.id}`}>
                        <a>
                            <CountryFlag country={player.country}/>{player.name}
                        </a>
                    </Link>,
                    "className": `player ${Functions.getTeamColor(player.team)}`
                },
                "started": {"value": s.start_timestamp, "displayValue": Functions.MMSS(s.start_timestamp - matchStart)},
                "ended": {"value": s.end_timestamp, "displayValue": Functions.MMSS(s.end_timestamp - matchStart)},
                "spreeTime": {
                    "value": s.total_time,
                    "displayValue": Functions.toPlaytime(s.total_time),
                    "className": "playtime"
                },
                "reason": {"value": s.killer, "displayValue": endReason},
                "kills": {"value": s.kills}
            });
        }

        return <InteractiveTable width={1} headers={headers} data={data}/>;
    }


    if(bLoading) return <Loading />;
    if(error !== null) return <ErrorMessage title="Extended Spree Summary" text={error}/>;

    return <div>
        <div className="default-header">Extended Spree Summary</div>
        {renderTable()}
    </div>
}

export default MatchSprees;

/*class MatchSprees extends React.Component{

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
            <Table2 width={1} players={true}>
                <tr>
                    <th>Player</th>
                    <th>Started</th>
                    <th>Ended</th>
                    <th>Spree Lifetime</th>
                    <th>End Reason</th>
                    <th>Total Kills</th>
                </tr>
                {rows}
            </Table2>
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

export default MatchSprees;*/