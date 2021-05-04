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
import Functions from '../../api/functions';
import Servers from '../../api/servers';
import Faces from '../../api/faces';
import WinRate from '../../api/winrate';
import Pings from '../../api/pings';
import Graph from '../../components/Graph/';
import PlayerAliases from '../../components/PlayerAliases/';
import Items from '../../api/items';
import PlayerItemsSummary from '../../components/PlayerItemsSummary/';
import Session from '../../api/session';
import SiteSettings from '../../api/sitesettings';
import Rankings from '../../api/rankings';
import PlayerRankings from '../../components/PlayerRankings/';


function Home({navSettings, pageSettings, session, host, playerId, summary, gametypeStats, gametypeNames, recentMatches, matchScores, totalMatches, 
	matchPages, matchPage, matchesPerPage, weaponStats, weaponNames, weaponImages, mapImages, serverNames, 
	latestWinRate, winRateHistory, matchDates, pingGraphData, aliases, faces, itemData, itemNames, ogImage, rankingsData, rankingPositions}) {

	//console.log(`servers`);
	if(summary === undefined){

		return (<div>
					<DefaultHead />
			
					<main>
						<Nav settings={navSettings} session={session}/>
						<div id="content">
						<div className="default">
							<div className="default-header">
								There is no player with that id.
							</div>
						</div>
						</div>
						<Footer session={session}/>
					</main>   
			</div>);
	}

	summary = JSON.parse(summary);
	
		const flag = summary.country;

		const name = summary.name;
		summary = JSON.stringify(summary);

		const country = Countires(flag);

		let titleName = name;

		if(titleName[titleName.length - 1].toLowerCase() !== 's'){
			titleName = `${name}'s`;
		}else{
			titleName = `${name}'`;
		}

		// /<img className="title-flag" src={`../images/flags/${country.code.toLowerCase()}.svg`} alt="flag"/>

		pingGraphData = JSON.parse(pingGraphData);

		const parsedInfo = JSON.parse(summary);

		pageSettings = JSON.parse(pageSettings);

		const parsedSession = JSON.parse(session);

		return (
				<div>
					<DefaultHead host={host} title={`${titleName} Career Profile`} 
						description={`View ${titleName} career profile, ${name} is from ${country.country}, last seen ${Functions.convertTimestamp(parsedInfo.last)},
						played ${parsedInfo.matches} matches with a winrate of ${parsedInfo.winrate.toFixed(2)}% and has played for a total of ${(parsedInfo.playtime / (60 * 60)).toFixed(2)} hours since ${Functions.convertTimestamp(parsedInfo.first)}.`} 
						keywords={`career,profile,${name},${country.country}`}
						image={ogImage} imageType="png"
					/>
					<main>
						<Nav settings={navSettings} session={session}/>
						<div id="content">
							<div className="default">
								<div className="default-header">
									 {titleName} Career Profile
								</div>


								<PlayerSummary session={parsedSession} pageSettings={pageSettings} summary={summary} flag={country.code.toLowerCase()} country={country.country} gametypeStats={gametypeStats}
									gametypeNames={gametypeNames} latestWinRate={latestWinRate} winRateHistory={winRateHistory} matchDates={matchDates}
									faces={faces}
								/>

								{(pageSettings["Display Rankings"] === "false") ? null :
								<PlayerRankings data={rankingsData} gametypeNames={gametypeNames} positions={rankingPositions}/>}

								{(pageSettings["Display Weapon Stats"] !== "true") ? null :
								<PlayerWeapons session={parsedSession} pageSettings={pageSettings} weaponStats={weaponStats} weaponNames={weaponNames} weaponImages={weaponImages} />}

								<PlayerItemsSummary data={itemData} names={itemNames}/>
								<PlayerAliases data={aliases} faces={faces} masterName={name}/>

								
								{(pageSettings["Display Ping History Graph"] !== "true") ? null :
								<div><div className="default-header">Ping History</div>
								<Graph title="Recent Ping History" data={JSON.stringify(pingGraphData.data)} text={JSON.stringify(pingGraphData.text)}/></div>}

								
								<PlayerRecentMatches session={parsedSession} pageSettings={pageSettings} playerId={playerId} matches={recentMatches} scores={matchScores} gametypes={gametypeNames} 
								totalMatches={totalMatches} matchPages={matchPages} currentMatchPage={matchPage} matchesPerPage={matchesPerPage} mapImages={mapImages}
								serverNames={serverNames} matchDates={matchDates}
								/>

							</div>
						</div>
						<Footer session={session}/>
					</main>   
				</div>
	)
}


function createWinRateData(results, gametypeNames){

	const data = [];
	const titles = [];
	const text = [];

	let r = 0;
	let currentTitle = "";




	for(let i = 0; i < results.length; i++){

		r = results[i];

		if(r.length === 0) continue;

		//if(r.gametypeName === "Not Found") continue;

		currentTitle = (gametypeNames[r[0].gametype] !== undefined) ? gametypeNames[r[0].gametype] : "Not Found";

		titles.push(currentTitle);

		data.push({
			"name": currentTitle,
			"data": []
		});

		text.push([]);

		r.sort((a, b) =>{

			a = a.matches;
			b = b.matches;

			if(a < b){
				return -1;
			}else if(a > b){
				return 1;
			}

			return 0;
		});

		for(let x = 0; x < r.length; x++){

			data[data.length - 1].data.push(parseFloat(r[x].winrate.toFixed(2)));
			text[text.length - 1].push(`Wins ${r[x].wins} Draws ${r[x].draws} Losses ${r[x].losses} `);
		}
		
	}

	const fixedData = [];

	for(let i = 0; i < data.length; i++){

		fixedData.push([data[i]]);
	}

	if(fixedData.length === 0){
		fixedData.push({
			"name": "all",
			"data": []
		});
	}


	return {"data": fixedData, "titles": titles, "text": text};


}

function createPingGraphData(history){

	const data = [
		{"name": "Min", "data": [0]},
		{"name": "Average", "data": [0]},
		{"name": "Mac", "data": [0]}
	];


	const text = [];

	let h = 0;

	for(let i = 0; i < history.length; i++){

		h = history[i];

		data[0].data.push(h.min);
		data[1].data.push(h.average);
		data[2].data.push(h.max);

		if(i !== 1){
			text.push(`${i + 1} Matches ago`);
		}else{
			text.push(`${i + 1} Match ago`);
		}

	}

	return {"data": data, "text": text};
}

export async function getServerSideProps({req, query}) {

	const settings = new SiteSettings();

	const navSettings = await settings.getCategorySettings("Navigation");
	const pageSettings = await settings.getCategorySettings("Player Pages");

	const matchesPerPage = parseInt(pageSettings["Recent Matches Per Page"]);
		
	const playerManager = new Player();
	const gametypes = new Gametypes();
	const maps = new Maps();
	const matchManager = new Matches();
	const weaponsManager = new Weapons();
	const serverManager = new Servers();

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

	const gametypeIds = Functions.getUniqueValues(gametypeStats, 'gametype');

	let gametypeNames = await gametypes.getNames(gametypeIds);


	const matchPage = (query.matchpage !== undefined) ? (parseInt(query.matchpage) === parseInt(query.matchpage) ? query.matchpage : 1) : 1;

	let recentMatches = [];

	if(pageSettings["Display Recent Matches"] === "true"){
		recentMatches = await playerManager.getRecentMatches(query.id, matchesPerPage, matchPage);
	}
	
	const matchPages = Math.ceil(totalMatches / matchesPerPage);

	const uniqueMaps = Functions.getUniqueValues(recentMatches, 'map_id');
	const matchIds = Functions.getUniqueValues(recentMatches, 'match_id');

	let mapData = await maps.getNames(uniqueMaps);

	let matchScores = await matchManager.getWinners(matchIds);

	let matchPlayerCount = await matchManager.getPlayerCount(matchIds);


	let weaponStats = [];
	let weaponNames = [];
	let weaponImages = [];

	if(pageSettings["Display Weapon Stats"] === "true"){
		weaponStats = await weaponsManager.getPlayerTotals(playerId);
		weaponNames = await weaponsManager.getAllNames();
		weaponImages = await weaponsManager.getImageList();
	}
	


	const justMapNames = [];

	for(const [key, value] of Object.entries(mapData)){
		justMapNames.push(value);
	}



	let mapImages = await maps.getImages(justMapNames);
	

	Functions.setIdNames(recentMatches, mapData, 'map_id', 'mapName');

	const serverNames = await serverManager.getAllNames();

	

	const serverIds = await matchManager.getServerNames(matchIds);

	Functions.setIdNames(recentMatches, serverIds, 'match_id', 'server');
	Functions.setIdNames(recentMatches, matchPlayerCount, 'match_id', 'players');


	const faceManager = new Faces();

	

	const winRateManager = new WinRate();
	let latestWinRate = await winRateManager.getPlayerLatest(playerId);
	Functions.setIdNames(latestWinRate, gametypeNames, 'gametype', 'gametypeName');

	gametypeIds.unshift(0);
	let winRateHistory = await winRateManager.getPlayerWinrateHistory(playerId, gametypeIds, 50);
	//Functions.setIdNames(winRateHistory, gametypeNames, 'gametype', 'gametypeName');

	
	winRateHistory = createWinRateData(winRateHistory, gametypeNames);

	//console.log(winRateHistory);

	let now = new Date();
	now = Math.floor(now * 0.001);

	const month = ((60 * 60) * 24) * 28;

	

	const matchDates = await playerManager.getMatchDatesAfter(now - month, playerId);

	//console.log(playerManager.getMatchDatesAfter());

	let pingHistory = [];
	let pingGraphData = [];

	if(pageSettings["Display Ping History Graph"] === "true"){

		const pingManager = new Pings();

		pingHistory = await pingManager.getPlayerHistoryAfter(playerId, 100);

		pingGraphData = createPingGraphData(pingHistory);
	}

	
	const aliases = await playerManager.getPossibleAliases(playerId);
	const usedFaces = [summary.face];

	for(let i = 0; i < aliases.length; i++){

		if(usedFaces.indexOf(aliases[i].face) === -1){
			usedFaces.push(aliases[i].face);
		}
	}

	

	const faceFiles = await faceManager.getFacesWithFileStatuses(usedFaces);

	let ogImage = "faces/faceless";

	for(const [key, value] of Object.entries(faceFiles)){

		ogImage = `faces/${value.name}`;
		break;
	}


	const itemManager = new Items();

	let playerItemData = [];
	let uniqueItemIds = [];
	let itemNames = [];

	



	if(pageSettings["Display Pickup History"] === "true"){
		playerItemData = await itemManager.getPlayerTotalData(playerId);
		uniqueItemIds = Functions.getUniqueValues(playerItemData, 'item');
		itemNames = await itemManager.getNamesByIds(uniqueItemIds);
	}

	const session = new Session(req.headers.cookie);

	await session.load();


	let rankingData = [];
	let rankingPositions = [];

	const rankingsManager = new Rankings();

	if(pageSettings["Display Rankings"] === "true"){

		rankingPositions = {};

		rankingData = await rankingsManager.getPlayerRankings(playerId);

		for(let i = 0; i < rankingData.length; i++){

			rankingPositions[rankingData[i].gametype] = await rankingsManager.getGametypePosition(rankingData[i].ranking, rankingData[i].gametype);
		}
	}

	

	return { 
		props: {
			"navSettings": JSON.stringify(navSettings),
			"pageSettings": JSON.stringify(pageSettings),
			"session": JSON.stringify(session.settings),
			"host": req.headers.host,
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
			"mapImages": JSON.stringify(mapImages),
			"serverNames": JSON.stringify(serverNames),
			//"face": currentFace[summary.face].name,
			"latestWinRate": JSON.stringify(latestWinRate),
			"winRateHistory": JSON.stringify(winRateHistory),
			"matchDates": JSON.stringify(matchDates),
			"pingGraphData": JSON.stringify(pingGraphData),
			"aliases": JSON.stringify(aliases),
			"faces": JSON.stringify(faceFiles),
			"itemData": JSON.stringify(playerItemData),
			"itemNames": JSON.stringify(itemNames),
			"ogImage": ogImage,
			"rankingsData": JSON.stringify(rankingData),
			"rankingPositions": JSON.stringify(rankingPositions)
			
		}
	}
}

export default Home;

