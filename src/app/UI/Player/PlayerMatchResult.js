const WON_ELEM = <span className="green">Won the match</span>;
const DRAW_ELEM = <span className="yellow">Drew the match</span>;
const LOST_ELEM = <span className="red">Lost the match</span>;
const SPEC_ELEM = <span className="none">Spectator</span>;


export default function PlayerMatchResult({playerId, data}){

    if(data.mh){
        const end = data.end_type.toLowerCase();
        if(end === "hunt successful!") return WON_ELEM;
        return LOST_ELEM;
    }

    if(data.match_result === "l"){
        return LOST_ELEM;
    }else if(data.match_result === "w"){
        return WON_ELEM;
    }else if(data.match_result === "d"){
        return DRAW_ELEM;
    }else if(data.match_result === "s"){
        return SPEC_ELEM;
    }

    return <span className="red">{data.end_type}</span>;
}