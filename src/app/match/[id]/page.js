import Image from "next/image";
import {getData} from "@/app/lib/match";
import Header from "@/app/UI/Header";
import MatchScoreBox from "@/app/UI/MatchScoreBox";
import InteractiveTable from "@/app/UI/InteractiveTable";
import { getTeamColorClass } from "../../lib/generic";
import FragTable from "@/app/UI/Match/FragTable";


export async function generateMetadata({ params, searchParams }, parent) {
    // read route params

    //const match = new Match();
    const id = params.id;

    //const matchData = await match.get(1);
   
    // fetch data
    //const product = await fetch(`https://.../${id}`).then((res) => res.json())
   
    // optionally access and extend (rather than replace) parent metadata
    //const previousImages = (await parent).openGraph?.images || []
   
    return {
      title: `Match ${id}`,
      /*openGraph: {
        images: ['/some-specific-page-image.jpg'],
      },*/
    }
}


   

export default async function MatchPage({params, searchParams}) {



    let matchId = params.id ?? -1;


    const matchData = await getData(matchId);

    console.log(Object.keys(matchData));
    //<MatchScoreBox data={matchData}/>

    const headers = {
      "id": {"title": "Player ID"},
      "name": {"title": "Name"}
    };

    const playerRows = [];

    for(const [playerId, playerName] of Object.entries(matchData.playerNames)){

		playerRows.push({
				"id": {"value": parseInt(playerId)},
				"name": {
				"value": playerName.toLowerCase(), 
				"displayValue": playerName,
				"className": getTeamColorClass(2)
			}
		});
    }

    return (
        <main>
          <Header>Match Report</Header> 
          <MatchScoreBox data={matchData.basic}/>
		      <FragTable data={JSON.stringify(matchData)} totalTeams={matchData.basic.total_teams}/>
          <InteractiveTable headers={headers} rows={playerRows}/>
        </main>
    );
}

//<FragTable data={matchData.playerData} playerNames={matchData.playerNames} totalTeams={matchData.basic.total_teams}/>