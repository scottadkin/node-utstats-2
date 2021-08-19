import MatchResultBox from "../../MatchResultBox";
import Functions from "../../../api/functions";
import Pagination from "../../Pagination";

const PlayerRecentMatches = ({data, images, playerId, page, pages, perPage}) =>{

    const elems = [];

    for(let i = 0; i < data.matches.length; i++){

        const d = data.matches[i];

        const cleanMapName = Functions.cleanMapName(d.mapfile).toLowerCase();
        const index = images.indexOf(cleanMapName);
        const image = (index !== -1) ? images[index] : "default";

        elems.push(
            <MatchResultBox key={i} serverName={d.servername} gametypeName={d.gamename} mapName={Functions.removeUnr(d.mapfile)}
                date={Functions.convertTimestamp(Functions.utDate(d.time))} playtime={Functions.MMSS(d.gametime)} players={d.players}
                totalTeams={d.totalTeams} result={d.result} mapImage={image} classic={true}
            />
        );

    }

    return <div className="m-bottom-25">
        <div className="default-header" id="recent-matches">Recent Matches</div>
        <Pagination currentPage={page + 1} pages={pages} perPage={perPage} results={data.totalMatches} 
            url={`/classic/player/${playerId}?matchPage=`} anchor={"#recent-matches"}
        />
        {elems}
    </div>
}

export default PlayerRecentMatches;