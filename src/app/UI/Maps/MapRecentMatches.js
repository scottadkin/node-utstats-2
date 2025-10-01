import MatchesTableView from "../MatchesTableView";

export default function MapRecentMatches({data}){
    return <div className="default">
        <div className="default-header">Recent Matches</div>
        <MatchesTableView data={data}/>
    </div>
}