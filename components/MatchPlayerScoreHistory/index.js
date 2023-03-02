import {React, useState, useEffect} from 'react';
import Graph from '../Graph';
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';


const MatchPlayerScoreHistory = ({matchId, players}) =>{

    const [bLoading, setbLoading] = useState(true);
    const [error, setError] = useState(null);
    const [graphData, setGraphData] = useState([]);

    useEffect(() =>{

        const controller = new AbortController();

        const loadData = async () =>{

            try{
                const req = await fetch("/api/match", {
                    "signal": controller.signal,
                    "headers": {"Content-type": "application/json"},
                    "method": "POST",
                    "body": JSON.stringify({"mode": "scorehistory", "matchId": matchId, "players": players})
                });

                const res = await req.json();

                if(res.error !== undefined){
                    setError(res.error);
                }else{
                    setGraphData(res.data);
                }

                setbLoading(false);

            }catch(err){

                if(err.name !== "AbortError"){
                    setError(err.toString())
                    console.trace(err);
                } 
            }

        }

        loadData();

        return () =>{
            controller.abort();
        }
    }, [matchId, players]);

    if(bLoading) return <Loading />;
    if(error !== null) return <ErrorMessage title="Player Score Graph" text={error}/>

    return <div>
        <div className="default-header">Player Score Graph</div>
        <Graph title="Score History" data={graphData}/>
    </div>
}

export default MatchPlayerScoreHistory;