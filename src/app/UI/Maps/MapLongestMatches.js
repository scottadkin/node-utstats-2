import MatchesTableView from "../MatchesTableView";

export default function MapLongestMatches({data}){

    return <div className="default">
        <div className="default-header">Longest Matches</div>
        <MatchesTableView data={data}/>
    </div>
}