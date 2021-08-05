const MatchAssaultSummary = ({data, matchId}) =>{

    let d = 0;

    for(let i = 0; i < data.length; i++){

        d = data[i];

    }

    return <div className="m-bottom-25">
        <div className="default-header">Assault Summary</div>
    </div>
}

export default MatchAssaultSummary;