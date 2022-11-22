
import React from 'react';
import Functions from '../../api/functions';
import Graph from '../Graph/';
import Table2 from '../Table2';
import Playtime from '../Playtime';


class PlayerGametypeStats extends React.Component{

    constructor(props){

        super(props);

        this.state = {"mode": 0};

        this.changeMode = this.changeMode.bind(this);
    }

    componentDidMount(){

        const settings = this.props.session;

        if(settings["playerPageGametypeMode"] !== undefined){
            this.setState({"mode": JSON.parse(settings["playerPageGametypeMode"])});
        }
    }

    changeMode(id){
        this.setState({"mode": id});
        Functions.setCookie("playerPageGametypeMode",id);
    }

    renderGeneral(){

        if(this.state.mode !== 0) return null;

        const data = JSON.parse(this.props.data);
        const names = JSON.parse(this.props.names);

        data.sort((a, b) =>{

            a = a.playtime;
            b = b.playtime;

            if(a < b){
                return 1;
            }else if(a > b){
                return -1;
            }

            return 0;
        });

        const elems = [];

        let d = 0;

        let winrate = 0;

        let totalWins = 0;
        let totalLosses = 0;
        let totalDraws = 0;
        let totalMatches = 0;
        let totalPlaytime = 0;
        let totalWinrate = 0;
        let totalGametypes = 0;
        let totalAccuracy = 0;
        let lastMatch = 0;

        for(let i = 0; i < data.length; i++){

            d = data[i];

            totalGametypes++;

            winrate = 0;

            if(d.matches > 0){

                if(d.wins > 0){

                    if(d.losses + d.draws === 0){
                        winrate = 100;
                    }else{

                        winrate = ((d.wins / d.matches) * 100).toFixed(2);
                    }
                }
            }

            if(d.last > lastMatch){
                lastMatch = d.last;
            }

            totalWins += d.wins;
            totalLosses += d.losses;
            totalDraws += d.draws;
            totalMatches += d.matches;
            totalPlaytime += d.playtime;
            totalAccuracy += d.accuracy;


            elems.push(<tr key={i}>
                <td>{(names[d.gametype] !== undefined) ? names[d.gametype] : "Not Found"}</td>
                <td>{d.accuracy.toFixed(2)}%</td>
                <td>{d.wins}</td>
                <td>{winrate}%</td>
                <td>{d.matches}</td>
                <td className="playtime"><Playtime timestamp={d.playtime}/></td>
                <td>{Functions.convertTimestamp(d.last)}</td>
            </tr>);
        }

        if(totalWins > 0){

            if(totalLosses + totalDraws === 0){
                totalWinrate = 1;
            }else{
                totalWinrate = ((totalWins / totalMatches) * 100).toFixed(2);
            }
        }


        elems.push(<tr key={"total"} className="black">
            <td>Totals</td>
            <td>{(totalAccuracy / totalGametypes).toFixed(2)}%</td>
            <td>{totalWins}</td>
            <td>{totalWinrate}%</td>
            <td>{totalMatches}</td>
            <td className="playtime"><Playtime timestamp={totalPlaytime}/></td>
            <td>{Functions.convertTimestamp(lastMatch)}</td>

        </tr>);

        return <Table2 width={1}>
                <tr>
                    <th>Gametype</th>
                    <th>Last Accuracy</th>
                    <th>Wins</th>
                    <th>Win Rate</th>
                    <th>Matches</th>
                    <th>Playtime</th>
                    <th>Last</th>
                </tr>
                {elems}
            </Table2>
       
    }


    renderWinRates(){

        if(this.state.mode !== 1) return null;

        const elems = [];

        const winRateData = JSON.parse(this.props.latestWinRate);

        if(winRateData.length === 0) return <div className="not-found">No Data</div>

        let last = null;

        let w = 0;
        let currentStreak = 0;

        for(let i = 0; i < winRateData.length; i++){

            w = winRateData[i];

            if(w.current_win_streak > 0){
                currentStreak = `${w.current_win_streak} win${(w.current_win_streak !== 1) ? 's' : "" }`;
            }else if(w.current_draw_streak > 0){
                currentStreak = `${w.current_draw_streak} draws${(w.current_draw_streak !== 1) ? 's' : "" }`;
            }else if(w.current_lose_streak > 0){
                currentStreak = `${w.current_lose_streak} Loss${(w.current_lose_streak !== 1) ? 'es' : "" }`;
            }

            //dont display all until last
            if(w.gametype === 0){

               last = <tr key={i} className="black">
                    <td>{w.gametypeName}</td>
                    <td>{w.matches}</td>
                    <td>{w.wins}</td>
                    <td>{w.draws}</td>
                    <td>{w.losses}</td>
                    <td>{w.winrate.toFixed(2)}%</td>
                    <td>{w.max_win_streak}</td>
                    <td>{w.max_draw_streak}</td>
                    <td>{w.max_lose_streak}</td>
                    <td>{currentStreak}</td>
                </tr>;
                continue;
            }

            elems.push(<tr key={i}>
                <td>{w.gametypeName}</td>
                <td>{w.matches}</td>
                <td>{Functions.ignore0(w.wins)}</td>
                <td>{Functions.ignore0(w.draws)}</td>
                <td>{Functions.ignore0(w.losses)}</td>
                <td>{w.winrate.toFixed(2)}%</td>
                <td>{Functions.ignore0(w.max_win_streak)}</td>
                <td>{Functions.ignore0(w.max_draw_streak)}</td>
                <td>{Functions.ignore0(w.max_lose_streak)}</td>
                <td>{currentStreak}</td>
            </tr>);
        }

        const winRateHistory = JSON.parse(this.props.winRateHistory);

        
        return <div>
            <Table2 width={1}>
                <tr>
                    <th>Gametype</th>
                    <th>Matches</th>
                    <th>Wins</th>
                    <th>Draws</th>
                    <th>Losses</th>
                    <th>Win Rate</th>
                    <th>Longest Win Streak</th>
                    <th>Longest Draw Streak</th>
                    <th>Longest Losing Streak</th>
                    <th>Current Streak</th>
                </tr>
                {elems}
                {last}
            </Table2>
            <div className="default-header">Winrate History</div>
            <Graph data={JSON.stringify(winRateHistory.data)} text={JSON.stringify(winRateHistory.text)} title={winRateHistory.titles} maxValue={100} minValue={0}/>
        </div>
    }


    render(){

        return <div className="special-table">
                <div className="default-header">Gametype Stats</div>
                <div className="tabs">
                    <div className={`tab ${(this.state.mode === 0) ? "tab-selected" : "" }`} onClick={(() =>{
                        this.changeMode(0);
                    })}>General</div>
                    <div className={`tab ${(this.state.mode === 1) ? "tab-selected" : "" }`} onClick={(() =>{
                        this.changeMode(1);
                    })}>Win Rate Summary</div>
                </div>
                {this.renderGeneral()}
                {this.renderWinRates()}
        </div>
    }
}


export default PlayerGametypeStats;