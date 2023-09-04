import {React, useState, useEffect} from 'react';
import CustomGraph from "../CustomGraph";
import Loading from '../Loading';
import ErrorMessage from '../ErrorMessage';
import {MMSS, scalePlaytime} from "../../api/generic.mjs";


const MatchPlayerScoreHistory = ({matchId, players, bHardcore, matchStart, matchEnd}) =>{

    const [bLoading, setbLoading] = useState(true);
    const [error, setError] = useState(null);
    const [graphData, setGraphData] = useState([]);
    const [graphLabels, setGraphLabels] = useState([]);

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
                    setGraphData(() => res.data);

                    const labels = res.labels.map((l) =>{
                        return MMSS(scalePlaytime(l - matchStart, bHardcore));
                    });

                    labels.push(MMSS(scalePlaytime(matchEnd - matchStart, bHardcore)));
                    labels.unshift(MMSS(0));

                    setGraphLabels(() => {return labels});
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
    }, [matchId, players, matchStart, matchEnd, bHardcore]);

    if(bLoading) return <Loading />;
    if(error !== null) return <ErrorMessage title="Player Score Graph" text={error}/>

    return <div>
        <div className="default-header">Player Score Graph</div>

        <CustomGraph 
            tabs={[
                {"name": "Player Score History", "title": "Player Score Over Time"}
            ]}
            data={[
                graphData
            ]}
            labels={[
                graphLabels
            ]}
            labelsPrefix={[
                "Player Score at "
            ]}
        />
    </div>
}

export default MatchPlayerScoreHistory;