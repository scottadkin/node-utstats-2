import {useEffect, useState} from "react";
import CustomGraph from "../CustomGraph";
import Loading from "../Loading";
import { MMSS, scalePlaytime } from "../../api/functions";

const loadData = async (matchId, totalTeams, players, setBLoading, setGraphData, setGraphLabels, matchStart, matchEnd, bHardcore) =>{

    try{

        const req = await fetch("/api/match", {
            "headers": {"Content-type": "application/json"},
            "method": "POST",
            "body": JSON.stringify({"mode": "ctfevents", "matchId": matchId, "teams": totalTeams, "players": players})
        });

        const res = await req.json();

        if(res.error === undefined){

            const d = res.data;
            const l = res.data.labels;
 
            const data = [
                d.caps,
                d.assists,
                d.grabs,
                d.pickups,
                d.covers,
                d.seals,
                d.kills,
                d.returns,
                d.saves,
                d.drops,
                d.teamCaps,
                d.teamAssists,
                d.teamGrabs,
                d.teamPickups,
                d.teamCovers,
                d.teamSeals,
                d.teamKills,
                d.teamReturns,
                d.teamSaves,
                d.teamDrops,
            ];

            const keys = [
                "caps", "assists","grabs","pickups","covers","seals","kills","returns","saves","drops"
            ];

            for(let i = 0; i < keys.length; i++){


                l[keys[i]] = l[keys[i]].map((d) =>{
                    return MMSS(scalePlaytime(d - matchStart, bHardcore));
                })

                l[keys[i]].unshift(MMSS(0));

            }

            const labels = [
                l.caps,
                l.assists,
                l.grabs,
                l.pickups,
                l.covers,
                l.seals,
                l.kills,
                l.returns,
                l.saves,
                l.drops,
                l.caps,
                l.assists,
                l.grabs,
                l.pickups,
                l.covers,
                l.seals,
                l.kills,
                l.returns,
                l.saves,
                l.drops,
            ];

            setGraphData(() => data);
            setGraphLabels(() => labels);
            setBLoading(() => false)
        }
        
    }catch(err){
        console.trace(err);
    }   
}

const MatchCTFGraphs = ({matchId, totalTeams, players, matchStart, matchEnd, bHardcore}) =>{

    const [bLoading, setBLoading] = useState(true);
    const [graphData, setGraphData] = useState([]);
    const [graphLabels, setGraphLabels] = useState([]);

    useEffect(() =>{

        const controller = new AbortController();

        loadData(matchId, totalTeams, players, setBLoading, setGraphData, setGraphLabels, matchStart, matchEnd, bHardcore);

        return () =>{
            controller.abort();
        }
    }, [matchStart, matchEnd, bHardcore, players, totalTeams, matchId]);


    const tabs = [
        {"name": "Caps", "title": "Flag Captures"},
        {"name": "Assists", "title": "Flag Assists"},
        {"name": "Grabs", "title": "Flag Grabs"},
        {"name": "Pickups", "title": "Flag Pickups"},
        {"name": "Covers", "title": "Flag Covers"},
        {"name": "Seals", "title": "Flag Seals"},
        {"name": "Kills", "title": "Flag Kills"},
        {"name": "Returns", "title": "Flag Returns"},
        {"name": "Close Saves", "title": "Flag Close Saves"},
        {"name": "Drops", "title": "Flag Drops"},
        {"name": "Team Caps", "title": "Flag Team Total Caps"},
        {"name": "Team Assists", "title": "Flag Team Total Assists"},
        {"name": "Team Grabs", "title": "Flag Team Total Grabs"},
        {"name": "Team Pickups", "title": "Flag Team Total Pickups"},
        {"name": "Team Covers", "title": "Flag Team Total Covers"},
        {"name": "Team Seals", "title": "Flag Team Total Seals"},
        {"name": "Team Kills", "title": "Flag Team Total Flag Kills"},
        {"name": "Team Returns", "title": "Flag Team Total Returns"},
        {"name": "Team Close Saves", "title": "Flag Team Total Close Saves"},
        {"name": "Team Drops", "title": "Flag Team Total Drops"}
    ];

    const labelsPrefix = [
        "Flag Caps ",
        "Flag Assists ",
        "Flag Grabs ",
        "Flag Pickups ",
        "Flag Covers ",
        "Flag Seals ",
        "Flag Kills ",
        "Flag Returns ",
        "Flag Close Saves ",
        "Flag Drops ",
        "Flag Caps ",
        "Flag Assists ",
        "Flag Grabs ",
        "Flag Pickups ",
        "Flag Covers ",
        "Flag Seals ",
        "Flag Kills ",
        "Flag Returns ",
        "Flag Close Saves ",
        "Flag Drops "
    ];

    if(bLoading){
        return <Loading />
    }

    return <>
        <div className="default-header">Capture The Flag Graphs</div>
        
        <CustomGraph tabs={tabs} labels={graphLabels} labelsPrefix={labelsPrefix} data={graphData}/>
    </>
}
/*
class MatchCTFGraphs extends React.Component{

    constructor(props){

        super(props);
        this.state = {"data": [], "finishedLoading": false};
    }

    async loadData(){

        try{

            const req = await fetch("/api/match", {
                "headers": {"Content-type": "application/json"},
                "method": "POST",
                "body": JSON.stringify({"mode": "ctfevents", "matchId": this.props.matchId, "teams": this.props.totalTeams, "players": this.props.players})
            });

            const res = await req.json();

            console.log(res.data);

            if(res.error === undefined){
                this.setState({"finishedLoading": true, "data": res.data});
            }
            
        }catch(err){
            console.trace(err);
        }   
    }

    async componentDidMount(){

        await this.loadData();
    }

    render(){

        if(!this.state.finishedLoading) return null;

        const titles = [
            "Flag Caps",
            "Flag Assists",
            "Flag Grabs",
            "Flag Pickups",
            "Flag Covers",
            "Flag Seals",
            "Flag Kills",
            "Flag Returns",
            "Flag Close Saves",
            "Flag Drops",
            "Team Flag Caps",
            "Team Flag Assists",
            "Team Flag Grabs",
            "Team Flag Pickups",
            "Team Flag Covers",
            "Team Flag Seals",
            "Team Flag Kills",
            "Team Flag Returns",
            "Team Flag Close Saves",
            "Team Flag Drops"
        ];

        const data = [
            this.state.data.caps,
            this.state.data.assists,
            this.state.data.grabs,
            this.state.data.pickups,
            this.state.data.covers,
            this.state.data.seals,
            this.state.data.kills,
            this.state.data.returns,
            this.state.data.saves,
            this.state.data.drops,
            this.state.data.teamCaps,
            this.state.data.teamAssists,
            this.state.data.teamGrabs,
            this.state.data.teamPickups,
            this.state.data.teamCovers,
            this.state.data.teamSeals,
            this.state.data.teamKills,
            this.state.data.teamReturns,
            this.state.data.teamSaves,
            this.state.data.teamDrops
        ];

        //dont sort teams by score you moron it messes up the colors
        for(let i = 0; i < 10; i++){

            data[i].sort((a, b) =>{
                a = a.name;
                b = b.name;

                if(a < b) return -1;
                if(b < a) return 1;
                return 0;
            })
        }

        let bAnyData = false;

        for(let i = 0; i < data.length; i++){

            const d = data[i];

            for(let x = 0; x < d.length; x++){

                if(d[x].data.length > 0){
                    bAnyData = true;
                    break;
                }
            }
        }

        if(!bAnyData) return null;

        return <div>
            <div className="default-header">Capture The Flag Graphs</div>
            <Graph title={titles} data={JSON.stringify(data)}/>
        </div>
    }
}*/

export default MatchCTFGraphs;