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
import Weapons from '../../api/weapons'
import PlayerWeapons from '../../components/PlayerWeapons/'



function Home({playerId, summary, gametypeStats, gametypeNames, recentMatches, mapData, matchScores, totalMatches, 
	matchPages, matchPage, matchesPerPage, weaponStats, weaponNames, weaponImages}) {

  //console.log(`servers`);
	if(summary === undefined){

		return (<div>
            <DefaultHead />
        
            <main>
                <Nav />
                <div id="content">
                <div className="default">
                    <div className="default-header">
                      There is no player with that id.
                    </div>
                </div>
                </div>
                <Footer />
            </main>   
        </div>);
	}
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

                    <PlayerWeapons weaponStats={weaponStats} weaponNames={weaponNames} weaponImages={weaponImages} />

                    <PlayerRecentMatches playerId={playerId} matches={recentMatches} maps={mapData} scores={matchScores} gametypes={gametypeNames} 
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
	const matchManager = new Matches();
	const weaponsManager = new Weapons();

	if(query.id === undefined) query.id = 0;

	const playerId = query.id;
	

    
	let summary = await playerManager.getPlayerById(playerId);
	
	if(summary === undefined){
		return {
			props: {}
		};
	}

	let gametypeStats = await playerManager.getPlayerGametypeWinStats(summary.name);
	
	const totalMatches = await playerManager.getTotalMatches(playerId);

	console.log(`I have played ${totalMatches} matches`);

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
    
    let matchScores = await matchManager.getWinners(matchIds);
    matchScores = JSON.stringify(matchScores);

    let weaponStats = await weaponsManager.getPlayerTotals(playerId);
    weaponStats = JSON.stringify(weaponStats);

    let weaponNames = await weaponsManager.getAllNames();
    weaponNames = JSON.stringify(weaponNames);
    //console.log(weaponStats);
    
    let weaponImages = await weaponsManager.getImageList();
    weaponImages = JSON.stringify(weaponImages);



  // Pass data to the page via props
    return { 
      	props: {  
            playerId,
            summary,
            gametypeStats,
            gametypeNames, 
            recentMatches,
            mapData,
            matchScores, 
            totalMatches,
            matchPages,
            matchPage,
            matchesPerPage,
            weaponStats,
            weaponNames,
            weaponImages
   		  } 
  	}
}

export default Home;

