import Image from "next/image";
import db from "../../../../api/database";
import Match from "../../../../api/match";



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

    const match = new Match();
    

    let matchId = params.id ?? -1;


    const matchData = await match.get(matchId);

    console.log(matchData);
    
    return (
        <main>
        </main>
    );
}
