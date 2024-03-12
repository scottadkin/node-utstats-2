import Image from "next/image";
import {getData} from "@/app/api/match";
import Header from "@/app/UI/Header";
import MatchScoreBox from "@/app/UI/MatchScoreBox";


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

    console.log(matchData);
    //<MatchScoreBox data={matchData}/>
    return (
        <main>
			<Header>Match Report</Header> 
			<MatchScoreBox data={matchData.basic}/>
        </main>
    );
}
