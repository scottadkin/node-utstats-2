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
import Matches from '../../api/matches'



function Home({summary, gametypeStats, gametypeNames, recentMatches, mapData, matchScores, totalMatches, matchPages, matchPage, matchesPerPage}) {

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

                    <PlayerRecentMatches matches={recentMatches} maps={mapData} scores={matchScores} gametypes={gametypeNames} 
					totalMatches={totalMatches} matchPages={matchPages} currentMatchPage={matchPage} matchesPerPage={matchesPerPage}/>

                </div>
                </div>
                <Footer />
            </main>   
        </div>
  )
}

export async function getServerSideProps({query}) {

	const matchesPerPage = 25;
    
    const playerManager = new Player();
    const gametypes = new Gametypes();
    const maps = new Maps();
	const MatchManager = new Matches();
	
	const totalMatches = await playerManager.getTotalMatches(query.id);

	console.log(`I have played ${totalMatches} matches`);
    
    let summary = await playerManager.getPlayerById(query.id);

    let gametypeStats = await playerManager.getPlayerGametypeWinStats(summary.name);

    const gametypeIds = [];

    for(let i = 0; i < gametypeStats.length; i++){
        gametypeIds.push(gametypeStats[i].gametype);
    }

    let gametypeNames = await gametypes.getNames(gametypeIds);

    gametypeNames = JSON.stringify(gametypeNames);

    summary = JSON.stringify(summary);
    gametypeStats = JSON.stringify(gametypeStats);


    const matchPage = (query.matchpage !== undefined) ? (parseInt(query.matchpage) === parseInt(query.matchpage) ? query.matchpage : 1) : 1;
	let recentMatches = await playerManager.getRecentMatches(query.id, matchesPerPage, matchPage);
	
	const matchPages = Math.ceil(totalMatches / matchesPerPage);


	const uniqueMaps = [];
	const matchIds = [];

    for(let i = 0; i < recentMatches.length; i++){

		matchIds.push(recentMatches[i].match_id)

      	if(uniqueMaps.indexOf(recentMatches[i].map_id) == -1){
        	uniqueMaps.push(recentMatches[i].map_id);
      	}
    }

	//console.log(matchIds);

    let mapData = await maps.getNamesByIds(uniqueMaps);
    mapData = JSON.stringify(mapData);
	recentMatches = JSON.stringify(recentMatches);
	
	let matchScores = await MatchManager.getWinners(matchIds);
	matchScores = JSON.stringify(matchScores);

  // Pass data to the page via props
    return { 
      	props: {  
       	 	summary,
        	gametypeStats,
        	gametypeNames, 
        	recentMatches,
			mapData,
			matchScores, 
			totalMatches,
			matchPages,
			matchPage,
			matchesPerPage
   		} 
  	}
}

export default Home;

