import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/';
import Footer from '../../components/Footer/';
import PlayerSummary from '../../components/PlayerSummary/';
import Player from '../../api/player';
import Link from 'next/link';
import Countires from '../../api/countries';
import Gametypes from '../../api/gametypes';
import Maps from '../../api/maps';
import PlayerRecentMatches from '../../components/PlayerRecentMatches/';
import Matches from '../../api/matches';
import Weapons from '../../api/weapons';
import PlayerWeapons from '../../components/PlayerWeapons/';
import Functions from '../../api/functions'



function Home({playerId, summary, gametypeStats, gametypeNames, recentMatches, matchScores, totalMatches, 
	matchPages, matchPage, matchesPerPage, weaponStats, weaponNames, weaponImages, mapImages}) {

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

                    <PlayerRecentMatches playerId={playerId} matches={recentMatches} scores={matchScores} gametypes={gametypeNames} 
					totalMatches={totalMatches} matchPages={matchPages} currentMatchPage={matchPage} matchesPerPage={matchesPerPage} mapImages={mapImages}/>

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

    const gametypeIds = [];

    for(let i = 0; i < gametypeStats.length; i++){
        gametypeIds.push(gametypeStats[i].gametype);
    }

    let gametypeNames = await gametypes.getNames(gametypeIds);


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


    let mapData = await maps.getNames(uniqueMaps);
   
    
    let matchScores = await matchManager.getWinners(matchIds);
    let weaponStats = await weaponsManager.getPlayerTotals(playerId);
    let weaponNames = await weaponsManager.getAllNames();
    let weaponImages = await weaponsManager.getImageList();

	const justMapNames = [];

	for(const [key, value] of Object.entries(mapData)){
		justMapNames.push(value);
	}

	let mapImages = await maps.getImages(justMapNames);

	Functions.setIdNames(recentMatches, mapData, 'map_id', 'mapName');




  // Pass data to the page via props
    return { 
		props: {
			"playerId": playerId,
			"summary": JSON.stringify(summary),
			"gametypeStats": JSON.stringify(gametypeStats),
			"gametypeNames": JSON.stringify(gametypeNames),
			"recentMatches": JSON.stringify(recentMatches),
			"matchScores": JSON.stringify(matchScores),
			"totalMatches": totalMatches,
			"matchPages": matchPages,
			"matchPage": matchPage,
			"matchesPerPage": matchesPerPage,
			"weaponStats": JSON.stringify(weaponStats),
			"weaponNames": JSON.stringify(weaponNames),
			"weaponImages": JSON.stringify(weaponImages),
			"mapImages": JSON.stringify(mapImages)
		}
      	/*props: {  
            playerId,
            summary,
            gametypeStats,
            gametypeNames, 
            recentMatches,
            matchScores, 
            totalMatches,
            matchPages,
            matchPage,
            matchesPerPage,
            weaponStats,
            weaponNames,
            weaponImages
   		} */
  	}
}

export default Home;

