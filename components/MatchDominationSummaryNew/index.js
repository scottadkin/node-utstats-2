import React from 'react';
import Graph from '../Graph';
import Functions from '../../api/functions';
import CountryFlag from '../CountryFlag';
import Link from 'next/link';

class MatchDominationSummaryNew extends React.Component{

    constructor(props){

        super(props);
        this.state = {"playerTotals": [], "pointsGraphData": [], "finishedLoading": false};
    }

    async loadData(){

        try{

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "playerdomcaps", "matchId": this.props.matchId, "pointNames": this.props.pointNames})
            });

            const res = await req.json();

            if(res.error === undefined){

                this.setState({
                    "playerTotals": res.playerTotals, 
                    "pointsGraphData": res.pointsGraph,
                    "finishedLoading": true
                });


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


    playersToTeams(){

        const players = {
            "red": [],
            "blue": [],
            "green": [],
            "yellow": []
        };

        for(let i = 0; i < this.props.players.length; i++){

            const p = this.props.players[i];

            switch(p.team){
                case 0: {   players.red.push(p.id); } break;
                case 1: {   players.blue.push(p.id); } break;
                case 2: {   players.green.push(p.id); } break;
                case 3: {   players.yellow.push(p.id); } break;
            }
        }

        return players;
    }

    getPlayerPointCaps(playerId, pointId){

        for(let i = 0; i < this.state.playerTotals.length; i++){

            const p = this.state.playerTotals[i];

            if(p.player === playerId){
                if(p.point === pointId){
                    return p.total_caps;
                }
            }
        }

        return 0;
    }
    

    renderTeamTable(players, teamId){

        const rows = [];
        const pointHeaders = [];
        const pointTotals = [];

        const teamColor = Functions.getTeamColor(teamId);

        for(let i = 0; i < this.props.pointNames.length; i++){

            const p = this.props.pointNames[i];

            pointHeaders.push(<th key={i}>{p.name}</th>);
            pointTotals.push(0);
        }


        for(let i = 0; i < players.length; i++){

            const p = players[i];
            const columns = [];

            for(let x = 0; x < this.props.pointNames.length; x++){

                const point = this.props.pointNames[x];

                const totalCaps = this.getPlayerPointCaps(p, point.id)
    
                columns.push(<td key={x}>{Functions.ignore0(totalCaps)}</td>);

                pointTotals[x] += totalCaps;
            }

            const currentPlayer = Functions.getPlayer(this.props.players, p);

            rows.push(<tr key={i}>
                <td className={`${teamColor}`}>
                    <Link href={`/pmatch/${this.props.matchId}?player=${currentPlayer.id}`}>
                        <a>
                            <CountryFlag country={currentPlayer.country}/>
                            
                            {currentPlayer.name}
                        </a>
                    </Link>
                </td>
                {columns}
            </tr>);
        }

        if(rows.length > 0){

            const totalsColumns = [];

            for(let i = 0; i < pointTotals.length; i++){

                totalsColumns.push(<td key={i}>{Functions.ignore0(pointTotals[i])}</td>);
            }

            rows.push(<tr key={`totals-${teamId}`}>
                <td>Totals</td>
                {totalsColumns}
            </tr>);
        }

        return <table className="t-width-1 m-bottom-25 player-td-1" key={teamId}>
            <tbody>
                <tr>
                    <th>Player</th>
                    {pointHeaders}
                </tr>
                {rows}
            </tbody>
        </table>

        
    }


    renderCapsTable(){


        const playersByTeam = this.playersToTeams();

        const tables = [];

        const names = ["red", "blue", "green", "yellow"];

        //this.renderTeamTable(playersByTeam.red, 0)
        for(let i = 0; i < this.props.totalTeams; i++){

            tables.push(this.renderTeamTable(playersByTeam[names[i]], i));
        }

        return <div>
           {tables}
        </div>
    }

    render(){

        if(!this.state.finishedLoading) return null;

        return <div>
            <div className="default-header">Domination Summary</div>
            {this.renderCapsTable()}
            <Graph title="Control Point Caps" data={JSON.stringify([this.state.pointsGraphData])}/>
        </div>
    }
}

export default MatchDominationSummaryNew;