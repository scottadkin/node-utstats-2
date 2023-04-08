import DefaultHead from '../../components/defaulthead';
import Nav from '../../components/Nav/';
import Footer from '../../components/Footer/';
import Player from '../../api/player';
import Players from '../../api/players';
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
import Analytics from '../../api/analytics';
import PlayerGeneral from '../../components/PlayerGeneral';
import PlayerGametypeStats from '../../components/PlayerGametypeStats';
import PlayerCTFSummary from '../../components/PlayerCTFSummary';
import PlayerCapRecords from '../../components/PlayerCapRecords';
import PlayerADSummary from '../../components/PlayerADSummary';
import PlayerFragSummary from '../../components/PlayerFragSummary';
import PlayerSpecialEvents from '../../components/PlayerSpecialEvents';
import Image from 'next/image';
import PlayerMonsterHuntStats from '../../components/PlayerMonsterHuntStats';
import PlayerMonsters from '../../components/PlayerMonsters';
import PlayerCombogibStats from '../../components/PlayerCombogibStats';
import PlayerTeleFrags from '../../components/PlayerTeleFrags';



function Home({navSettings, pageSettings, pageOrder, session, host, playerId, summary, gametypeStats, gametypeNames, recentMatches, matchScores, totalMatches, 
	matchPages, matchPage, matchesPerPage, weaponStats, weaponImages, mapImages, serverNames, 
	latestWinRate, winRateHistory, matchDates, pingGraphData, aliases, faces, itemData, itemNames, ogImage, 
	rankingsData, rankingPositions, capRecordsMode}) {


	const imageHost = Functions.getImageHostAndPort(host);

	//console.log(`servers`);
	if(summary === undefined){

		return <div>
				<DefaultHead host={host} title={`Player Not Found`} 
					description={`Player not found.`} 
					keywords={`career,profile,not,found`}
				/>
		
				<main>
					<Nav settings={navSettings} session={session}/>
					<div id="content">
						<div className="default">
							<div className="default-header">
								There is no player with that id.
							</div>
							<Image src="/images/temp.jpg" width="512" height="512" alt="Horse"/>
							<Image src="/images/temp2.jpg" width="512" height="512" alt="Another Horse"/>
						</div>
					</div>
					<Footer session={session}/>
				</main>   
			</div>;
	}

	summary = JSON.parse(summary);
	
	const flag = summary.country;

	const name = summary.name;
	const parsedSummary = summary;
	summary = JSON.stringify(summary);

	const country = Countires(flag);

	let titleName = name;

	if(titleName[titleName.length - 1].toLowerCase() !== 's'){
		titleName = `${name}'s`;
	}else{
		titleName = `${name}'`;
	}

	pingGraphData = JSON.parse(pingGraphData);

	pageSettings = JSON.parse(pageSettings);
	pageOrder = JSON.parse(pageOrder);

	const parsedSession = JSON.parse(session);

	let description = `View ${titleName} career profile, ${name} is from ${country.country}, last seen ${Functions.convertTimestamp(parsedSummary.last)},`;
	description += `played ${parsedSummary.matches} matches with a winrate of ${parsedSummary.winrate.toFixed(2)}% and has played for a total of ${(parsedSummary.playtime / (60 * 60)).toFixed(2)} hours since ${Functions.convertTimestamp(parsedSummary.first)}.` ;

	const parsedFaces = JSON.parse(faces);


	const elems = [];

	if(pageSettings["Display Summary"] === "true"){

		elems[pageOrder["Display Summary"]] = <PlayerGeneral key={1} country={country.country}
            host={host}
            flag={flag}
            face={parsedFaces[parsedSummary.face].name}
            first={parsedSummary.first}
            last={parsedSummary.last}
            matches={parsedSummary.matches}
            playtime={parsedSummary.playtime}
            winRate={parsedSummary.winrate}
            wins={parsedSummary.wins}
            losses={parsedSummary.losses}
            draws={parsedSummary.draws}     
        />;
    }

	if(pageSettings["Display Gametype Stats"] === "true"){

		elems[pageOrder["Display Gametype Stats"]] = <PlayerGametypeStats 
			key={2} 
			session={session} 
			data={gametypeStats} 
			names={gametypeNames} 
			latestWinRate={latestWinRate} 
			winRateHistory={winRateHistory}
		/>;
    }

	if(pageSettings["Display Capture The Flag Summary"] === "true"){

		elems[pageOrder["Display Capture The Flag Summary"]] = <PlayerCTFSummary key={"p-ctf-s"} playerId={playerId} />;
    }

	if(pageSettings["Display Capture The Flag Cap Records"] === "true"){

		elems[pageOrder["Display Capture The Flag Cap Records"]] = <PlayerCapRecords key="3a" playerId={playerId} mode={capRecordsMode}/>;
    }

	if(pageSettings["Display Assault & Domination"] === "true"){

		elems[pageOrder["Display Assault & Domination"]] = <PlayerADSummary 
			key={4} 
			dom={parsedSummary.dom_caps} 
			domBest={parsedSummary.dom_caps_best} 
			domBestLife={parsedSummary.dom_caps_best_life} 
			assault={parsedSummary.assault_objectives}
		/>;
    }

	if(pageSettings["Display Frag Summary"] === "true"){

		elems[pageOrder["Display Frag Summary"]] = <PlayerFragSummary key={5}
            session={session}
            score={parsedSummary.score}
            frags={parsedSummary.frags}
            kills={parsedSummary.kills}
            deaths={parsedSummary.deaths}
            suicides={parsedSummary.suicides}
            teamKills={parsedSummary.team_kills}
            spawnKills={parsedSummary.spawn_kills}
            efficiency={parsedSummary.efficiency}
            firstBlood={parsedSummary.first_bloods}
            accuracy={parsedSummary.accuracy}
            close={parsedSummary.k_distance_normal}
            long={parsedSummary.k_distance_long}
            uber={parsedSummary.k_distance_uber}
            headshots={parsedSummary.headshots}
            spawnKillSpree={parsedSummary.best_spawn_kill_spree}
        />;
    }

	if(pageSettings["Display Special Events"] === "true"){

		elems[pageOrder["Display Special Events"]] = <PlayerSpecialEvents session={session} key={6}
            data={parsedSummary}
        />;
    }

	if(pageSettings["Display Rankings"] === "true"){

		elems[pageOrder["Display Rankings"]] = <PlayerRankings key={"pr"} data={rankingsData} gametypeNames={gametypeNames} positions={rankingPositions}/>;
	}

	if(pageSettings["Display Weapon Stats"] === "true"){

		elems[pageOrder["Display Weapon Stats"]] = <PlayerWeapons key={"pw"} session={parsedSession} pageSettings={pageSettings} playerId={playerId}/>;

	}

	if(pageSettings["Display Items Summary"] === "true"){

		elems[pageOrder["Display Items Summary"]] = <PlayerItemsSummary key={"pi"} data={JSON.parse(itemData)} names={JSON.parse(itemNames)}/>;
	}

	if(pageSettings["Display Aliases"] === "true"){

		elems[pageOrder["Display Aliases"]] = <PlayerAliases key={"pa"} data={aliases} faces={faces} masterName={name} host={imageHost}/>;
	}


	if(pageSettings["Display Ping History Graph"] === "true"){

		elems[pageOrder["Display Ping History Graph"]] = <div key={"ppg"}>
			<div className="default-header">Ping History</div>
			<Graph title="Recent Ping History" data={JSON.stringify(pingGraphData.data)} text={JSON.stringify(pingGraphData.text)}/>
		</div>
	}

	if(pageSettings["Display Recent Matches"] === "true"){

		elems[pageOrder["Display Recent Matches"]] = <PlayerRecentMatches key={"prm"} 
			session={parsedSession} pageSettings={pageSettings} playerId={playerId} matches={recentMatches} scores={matchScores} gametypes={gametypeNames} 
			totalMatches={totalMatches} matchPages={matchPages} currentMatchPage={matchPage} matchesPerPage={matchesPerPage} mapImages={mapImages}
			serverNames={serverNames} matchDates={matchDates}
		/>
	}


	if(pageSettings["Display Monsterhunt Basic Stats"] === "true"){

		elems[pageOrder["Display Monsterhunt Basic Stats"]] = <PlayerMonsterHuntStats 
			key="player-monsters"
			kills={parsedSummary.mh_kills} 
			bestKillsLife={parsedSummary.mh_kills_best_life}
			bestKills={parsedSummary.mh_kills_best}
			totalDeaths={parsedSummary.mh_deaths}
			mostDeaths={parsedSummary.mh_deaths_worst}
		/>
	}

	if(pageSettings["Display Monsterhunt Monster Stats"] === "true"){

		elems[pageOrder["Display Monsterhunt Monster Stats"]] = <PlayerMonsters key="player-monsters-detailed" playerId={playerId}/>;
	}

	if(pageSettings["Display Combogib Stats"] === "true"){

		elems[pageOrder["Display Combogib Stats"]] = <PlayerCombogibStats key="player-combo-stats" playerId={playerId}/>;
	}

	if(pageSettings["Display Telefrag Stats"] === "true"){

		elems[pageOrder["Display Telefrag Stats"]] = <PlayerTeleFrags key="tf" playerId={playerId} />
	}

	return (
			<div>
				<DefaultHead host={host} title={`${titleName} Career Profile`} 
					description={description}
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

							{elems}

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
		{"name": "Max", "data": [0]}
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


function getOGImage(faceFiles, faceId){

	if(faceFiles[faceId] !== undefined){
		return `faces/${faceFiles[faceId].name}`;
	}

	return "faces/faceless";

}

export async function getServerSideProps({req, query}) {

	const settings = new SiteSettings();

	const navSettings = await settings.getCategorySettings("Navigation");
	const pageSettings = await settings.getCategorySettings("Player Pages");
	const pageOrder = await settings.getCategoryOrder("Player Pages");

	const matchesPerPage = parseInt(pageSettings["Recent Matches Per Page"]);
		
	const playerManager = new Player();
	const gametypes = new Gametypes();
	const maps = new Maps();
	const matchManager = new Matches();
	const serverManager = new Servers();

	const session = new Session(req);

	await session.load();

	if(query.id === undefined) query.id = 0;

	const capRecordsMode = (query.capRecordsMode !== undefined) ? parseInt(query.capRecordsMode) : 0;

	const playerId = query.id;
		
	let summary = await playerManager.getPlayerById(playerId);
	
	if(summary === undefined){
		return {
			props: {
				"session": JSON.stringify(session.settings)
			}
		};
	}

	let gametypeStats = await playerManager.getPlayerGametypeWinStats(summary.name);
	const totalMatches = await playerManager.getTotalMatches(playerId, matchManager);
	const gametypeIds = Functions.getUniqueValues(gametypeStats, 'gametype');
	let gametypeNames = await gametypes.getNames(gametypeIds);
	const matchPage = (query.matchpage !== undefined) ? (parseInt(query.matchpage) === parseInt(query.matchpage) ? query.matchpage : 1) : 1;

	let recentMatches = [];

	if(pageSettings["Display Recent Matches"] === "true"){
		recentMatches = await playerManager.getRecentMatches(query.id, matchesPerPage, matchPage, matchManager);
	}

	const recentMatchIds = recentMatches.map((matchResult) =>{
		return matchResult.match_id;
	});

	const dmWinners = await matchManager.getDmWinners(recentMatchIds, new Players());

	for(let i = 0; i < recentMatches.length; i++){

		const r = recentMatches[i];

		if(dmWinners.matchWinners[r.match_id] !== undefined){

			r.dmWinner = dmWinners.players[dmWinners.matchWinners[r.match_id]];
		}
	}

	const matchPages = Math.ceil(totalMatches / matchesPerPage);

	const uniqueMaps = Functions.getUniqueValues(recentMatches, 'map_id');
	const matchIds = Functions.getUniqueValues(recentMatches, 'match_id');

	let mapData = await maps.getNames(uniqueMaps);
	let matchScores = await matchManager.getWinners(matchIds);
	let matchPlayerCount = await matchManager.getPlayerCount(matchIds);



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

	
	winRateHistory = createWinRateData(winRateHistory, gametypeNames);

	let now = new Date();
	now = Math.floor(now * 0.001);

	const month = ((60 * 60) * 24) * 28;

	const matchDates = await playerManager.getMatchDatesAfter(now - month, playerId);

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

	const ogImage = getOGImage(faceFiles, summary.face);

	const itemManager = new Items();

	let playerItemData = [];
	let uniqueItemIds = [];
	let itemNames = [];

	



	if(pageSettings["Display Pickup History"] === "true"){
		playerItemData = await itemManager.getPlayerTotalData(playerId);
		uniqueItemIds = Functions.getUniqueValues(playerItemData, 'item');
		itemNames = await itemManager.getNamesByIds(uniqueItemIds);
	}



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


	await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);
	

	return { 
		props: {
			"navSettings": JSON.stringify(navSettings),
			"pageSettings": JSON.stringify(pageSettings),
			"pageOrder": JSON.stringify(pageOrder),
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
			"mapImages": JSON.stringify(mapImages),
			"serverNames": JSON.stringify(serverNames),
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
			"rankingPositions": JSON.stringify(rankingPositions),
			"capRecordsMode": capRecordsMode
			
		}
	}
}

export default Home;

