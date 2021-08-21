import MatchResultBox from "../../MatchResultBox";
import Functions from "../../../api/functions";

const HomeRecentMatches = ({data}) =>{

    if(data.length === 0) return null;

    const elems = [];

    for(let i = 0; i < data.length; i++){

        const d = data[i];

        elems.push(<MatchResultBox key={i} serverName={d.servername} gametypeName={d.gamename} mapName={Functions.removeUnr(d.mapfile)}
            date={Functions.convertTimestamp(Functions.utDate(d.time))} playtime={Functions.MMSS(d.gametime)} players={d.players}
            totalTeams={d.totalTeams} result={d.result} mapImage={d.image} classic={true}
        />);

    }

    return <div className="m-bottom-25">
        <div className="default-header">Recent Matches</div>
        {elems}
    </div>

}

export default HomeRecentMatches;