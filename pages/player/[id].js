import DefaultHead from '../../components/defaulthead'
import Nav from '../../components/Nav/'
import Footer from '../../components/Footer/'
import PlayerSummary from '../../components/PlayerSummary/'
import Player from '../../api/player'
import Link from 'next/link'
import Countires from '../../api/countries'
import Gametypes from '../../api/gametypes'
import Maps from '../../api/maps'
import PlayerRecentMatches from '../../components/PlayerRecentMatches/'



function Home({summary, gametypeStats, gametypeNames, recentMatches, mapData}) {

  //console.log(`servers`);

    //console.log(summary);
    summary = JSON.parse(summary);

    const flag = summary.country;

    const name = summary.name;
    summary = JSON.stringify(summary);

    const country = Countires(flag);

    return (
        <div>
            <DefaultHead />
        
            <main>
                <Nav />
                <div id="content">
                <div className="default">
                    <div className="default-header">
                      <img className="title-flag" src={`../images/flags/${country.code.toLowerCase()}.svg`} alt="flag"/> {name} Career Profile
                    </div>

                    <PlayerSummary summary={summary} flag={country.code.toLowerCase()} country={country.country} gametypeStats={gametypeStats}
                      gametypeNames={gametypeNames}
                    />

                    <PlayerRecentMatches matches={recentMatches} maps={mapData}/>

                </div>
                </div>
                <Footer />
            </main>   
        </div>
  )
}

// This gets called on every request
export async function getServerSideProps({query}) {
  // Fetch data from external API

   // console.log(query);
   // const router = useRouter();
    
    const playerManager = new Player();
    const gametypes = new Gametypes();
    const maps = new Maps();
    
    let summary = await playerManager.getPlayerById(query.id);

    let gametypeStats = await playerManager.getPlayerGametypeWinStats(summary.name);

    const gametypeIds = [];

    for(let i = 0; i < gametypeStats.length; i++){
        gametypeIds.push(gametypeStats[i].gametype);
    }

    //console.log(gametypeIds);

    let gametypeNames = await gametypes.getNames(gametypeIds);

    gametypeNames = JSON.stringify(gametypeNames);

    summary = JSON.stringify(summary);
    gametypeStats = JSON.stringify(gametypeStats);


    let recentMatches = await playerManager.getRecentMatches(query.id, 5);

    const uniqueMaps = [];

    for(let i = 0; i < recentMatches.length; i++){

      if(uniqueMaps.indexOf(recentMatches[i].map_id) == -1){
        uniqueMaps.push(recentMatches[i].map_id);
      }
    }

    let mapData = await maps.getNamesByIds(uniqueMaps);
    mapData = JSON.stringify(mapData);
    recentMatches = JSON.stringify(recentMatches);


  // Pass data to the page via props
    return { 
      props: {  
        summary,
        gametypeStats,
        gametypeNames, 
        recentMatches,
        mapData
    } 
  }
}

export default Home;

