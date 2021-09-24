import DefaultHead from '../components/defaulthead'
import Nav from '../components/Nav/'
import Footer from '../components/Footer/';
import Matches from '../api/matches';
import MatchesDefaultView from '../components/MatchesDefaultView/';
import Functions from '../api/functions';
import Maps from '../api/maps';
import Gametypes from '../api/gametypes';
import Servers from '../api/servers';
import PopularCountries from '../components/PopularCountries/';
import CountryManager from '../api/countriesmanager';
import Countries from '../api/countries';
//import GeneralStatistics from '../components/GeneralStatistics/';
import Players from '../api/players';
import React from 'react';
import Graph from '../components/Graph/';
import BasicPlayers from '../components/BasicPlayers/';
import Faces from '../api/faces';
import HomeTopMaps from '../components/HomeTopMaps/';
import HomeMostPlayedGametypes from '../components/HomeMostPlayedGametypes/';
import MostUsedFaces from '../components/MostUsedFaces/';
import Session from '../api/session';
import SiteSettings from '../api/sitesettings';
import MatchesTableView from '../components/MatchesTableView/';
import Screenshot from '../components/Screenshot';
import Analytics from '../api/analytics';

function createDatesGraphData(data){

	const dayText = [];
	const weekText = [];
	const monthText = [];

	const playersWeek = [0, 0, 0, 0, 0, 0];
	const matchesWeek = [0, 0, 0, 0, 0, 0];

	for(let i = 0; i < 7; i++){

		playersWeek[i] = data.players.days[i];
		matchesWeek[i] = data.matches.days[i];
	}

	for(let i = 0; i < 28; i++){

		monthText.push(`Day ${i} to Day ${i+1}`);

		if(i < 7){
			weekText.push(`Day ${i} to Day ${i+1}`);
		}

		if(i < 24){
			dayText.push(`Hour ${i} to Hour ${i+1}`);
		}
	}
	
	return {
		"title": ["Stats Past 24 Hours", "Stats Past 7 Days", "Stats Past 28 Days"],
		"data": [
			[{"name": "Matches", "data": data.matches.hours}, {"name": "Players", "data": data.players.hours}],
			[{"name": "Matches", "data": matchesWeek}, {"name": "Players", "data": playersWeek}],
			[{"name": "Matches", "data": data.matches.days}, {"name": "Players", "data": data.players.days}],
		],
		"text": [
			dayText,
			weekText,
			monthText
		]
	};

}



function Home({navSettings, pageSettings, session, host, matchesData, countriesData, mapImages, matchDates,
	addictedPlayersData, recentPlayersData, faceFiles, mostPlayedMaps, gametypeStats, mostUsedFaces, query, gametypeImages, 
	latestMatchPlayers, latestMatchImage, latestFaces}) {

	matchDates = JSON.parse(matchDates);

	const graphData = createDatesGraphData(matchDates);

	pageSettings = JSON.parse(pageSettings);

	let message = [];

	if(query.loggedin !== undefined){

		message = <div className="pass">
			Successfully Logged In.
		</div>;
	}

	if(query.loggedout !== undefined){

		message = <div className="pass">
			Successfully Logged Out.
		</div>;
	}

	if(query.registered !== undefined){

		message = <div className="pass">
			Successfully created account.<br/>
			You will have to wait until an admin activates your account before you can login.
		</div>;
	}	


	const elems = [];


	if(JSON.parse(matchesData).length > 0){

		if(pageSettings["Display Latest Match"] === "true"){
			const latestMatch = JSON.parse(matchesData)[0];
			
			elems.push(<Screenshot 
				key={"match-sshot"} map={latestMatch.mapName} totalTeams={latestMatch.total_teams} players={latestMatchPlayers} image={`/images/maps/${JSON.parse(latestMatchImage)}.jpg`} 
				matchData={JSON.stringify(latestMatch)}
				serverName={latestMatch.serverName} gametype={latestMatch.gametypeName} faces={latestFaces} bHome={true}
			/>);
		}
		

		if(pageSettings["Display Recent Matches"] === "true"){

			elems.push(<div key={"recent-matches"}>

				<div className="default-header">Recent Matches</div>
			
				{(pageSettings["Recent Matches Display Type"] === "0") ? <MatchesDefaultView images={mapImages} data={matchesData} /> : 
				<MatchesTableView data={matchesData}/> }

			</div>);
		}
	}

	if(graphData !== null){

		if(pageSettings["Display Recent Matches & Player Stats"] === "true"){
			elems.push(
				<div key={"matches-graph"}>
					<div className="default-header">Recent Matches &amp; Player Stats</div>
					<Graph title={graphData.title} data={JSON.stringify(graphData.data)} text={JSON.stringify(graphData.text)}/>
				</div>
			);
		}
	}

	if(JSON.parse(gametypeStats).length > 0){
		
		if(pageSettings["Display Most Played Gametypes"] === "true"){
			elems.push(<HomeMostPlayedGametypes key={"monstplayedgametypes"} data={gametypeStats} images={JSON.parse(gametypeImages)}/>);
		}
	}



	if(JSON.parse(mostPlayedMaps).length > 0){

		if(pageSettings["Display Most Played Maps"] === "true"){
			elems.push(<HomeTopMaps key={"maps"} maps={mostPlayedMaps} images={mapImages}/>);
		}
	}

	if(JSON.parse(recentPlayersData).length > 0){

		if(pageSettings["Display Recent Players"] === "true"){
			elems.push(<BasicPlayers key={"recent-players"} title="Recent Players" players={recentPlayersData} faceFiles={faceFiles}/>);
		}
	}

	if(JSON.parse(addictedPlayersData).length > 0){

		if(pageSettings["Display Addicted Players"] === "true"){
			elems.push(<BasicPlayers key={"addicted-players"} title="Addicted Players" players={addictedPlayersData} faceFiles={faceFiles}/>);
		}
	}

	if(JSON.parse(mostUsedFaces).length > 0){

		if(pageSettings["Display Most Used Faces"] === "true"){
			elems.push(<MostUsedFaces key={"faces"} data={mostUsedFaces} images={faceFiles}/>);
		}
	}


	if(JSON.parse(countriesData).length > 0){

		if(pageSettings["Display Most Popular Countries"] === "true"){

			elems.push(<PopularCountries key={"countries"} data={countriesData}/>);
		}

	}

	//<GeneralStatistics totalMatches={totalMatches} firstMatch={firstMatch} lastMatch={lastMatch} totalPlayers={totalPlayers}/>
	return (
		<div>
		<DefaultHead host={host} title={"Home"} description="Welcome to Node UTStats 2, view various stats for players,matches,maps,records and more!" keywords="home,welcome"/>
		
		<main>
			<Nav settings={navSettings} session={session}/>
			<div id="content">
				<div className="default">
			
				{message}

				<div className="default-header">Welcome to Node UTStats 2</div>
				<div id="welcome-text">Here you can look up information for UT matches, players, and maps.</div>

				{elems}
				
			</div>
			</div>
			<Footer session={session}/>
		</main>   
		</div>
	)
}


export async function getServerSideProps({req, query}) {

	const session = new Session(req);

	await session.load();

	const siteSettings = new SiteSettings();

	const pageSettings = await siteSettings.getCategorySettings("Home");
	const navSettings = await siteSettings.getCategorySettings("Navigation");


	const matchManager = new Matches();
	const mapManager = new Maps();
	const gametypeManager = new Gametypes();
	const serverManager = new Servers();
	const countriesM = new CountryManager();
	const playerManager = new Players();

	let matchesData = [];

	if(pageSettings["Display Recent Matches"] === "true"){
		matchesData = await matchManager.getRecent(0, pageSettings["Recent Matches To Display"]);
	}

	let mostPlayedMaps = [];

	if(pageSettings["Display Most Played Maps"] === "true"){
		mostPlayedMaps = await mapManager.getMostPlayed(4);
	}

	let mapIds = Functions.getUniqueValues(matchesData, 'map');
	const gametypeIds = Functions.getUniqueValues(matchesData, 'gametype');
	const serverIds = Functions.getUniqueValues(matchesData, 'server');

	let mapNames = await mapManager.getNames(mapIds);
	
	for(let i = 0; i < mostPlayedMaps.length; i++){

		if(mapNames[mostPlayedMaps[i].id] === undefined){
			mapNames[mostPlayedMaps[i].id] = mostPlayedMaps[i].name;
		}
	}

	const gametypeNames = await gametypeManager.getNames(gametypeIds);
	const serverNames = await serverManager.getNames(serverIds);

	
	let countryData = [];

	if(pageSettings["Display Most Popular Countries"] === "true"){
		countryData = await countriesM.getMostPopular();
	}

	Functions.setIdNames(matchesData, mapNames, 'map', 'mapName');
	Functions.setIdNames(matchesData, gametypeNames, 'gametype', 'gametypeName');
	Functions.setIdNames(matchesData, serverNames, 'server', 'serverName');

	for(let i = 0; i < countryData.length; i++){

		countryData[i]['name'] = Countries(countryData[i].code).country;
	}

	const totalMatches = await matchManager.getTotal();
	const firstMatch = await matchManager.getFirst();
	const lastMatch = await matchManager.getLast();
	const totalPlayers = await playerManager.getTotalPlayers();

	let justMapNames = [];

	for(const [ket, value] of Object.entries(mapNames)){
		justMapNames.push(Functions.removeUnr(Functions.removeMapGametypePrefix(value)));
	}

	const mapImages = await mapManager.getImages(justMapNames);

	let matchDates = {
		"matches": {"hours": [], "days": []},
		"players": {"hours": [], "days": []}
	};

	if(pageSettings["Display Recent Matches & Player Stats"] === "true"){
		//matchDates = await matchManager.getDatesPlayersInRecentDays(28);

		const day = (60 * 60) * 24;

		const playersLast24Hours = await playerManager.getUniquePlayersInRecentUnits(24, 60 * 60);
		const playersLast28Days = await playerManager.getUniquePlayersInRecentUnits(28, day);


		const matchesLast24Hours = await matchManager.getMatchesInRecentUnits(24, 60 * 60);
		const matchesLast28Days = await matchManager.getMatchesInRecentUnits(28, day);
		
		matchDates = {
			"matches": {"hours": matchesLast24Hours, "days": matchesLast28Days},
			"players": {"hours": playersLast24Hours, "days": playersLast28Days}
		};
	}


	let addictedPlayersData = [];
	let recentPlayersData = [];

	if(pageSettings["Display Addicted Players"] === "true"){
		addictedPlayersData = await playerManager.getAddictedPlayers(5);
	}

	if(pageSettings["Display Recent Players"] === "true"){
		recentPlayersData = await playerManager.getRecentPlayers(5);
	}

	let faceIds = Functions.getUniqueValues(addictedPlayersData, 'face');

	faceIds = faceIds.concat(Functions.getUniqueValues(recentPlayersData, 'face'));

	const faceManager = new Faces();

	let mostUsedFaces = [];

	if(pageSettings["Display Most Used Faces"] === "true"){
		mostUsedFaces = await faceManager.getMostUsed(5);
	}

	faceIds = faceIds.concat(Functions.getUniqueValues(mostUsedFaces, 'id'));

	const faceFiles = await faceManager.getFacesWithFileStatuses(faceIds);

	let gametypeStats = [];
	let gametypeImages = [];

	if(pageSettings["Display Most Played Gametypes"] === "true"){

		gametypeStats = await gametypeManager.getMostPlayed(5);

		const imageGametypeNames = [];

		for(let i = 0; i < gametypeStats.length; i++){
	
			imageGametypeNames.push(gametypeStats[i].name.replace(/ /ig,'').toLowerCase());
		}
	
		gametypeImages = gametypeManager.getMatchingImages(imageGametypeNames, false);
	}

	let latestMatchPlayers = [];

	let latestMatchImage = "default";

	let latestFaces = [];

	if(pageSettings["Display Latest Match"] === "true"){

		if(matchesData.length > 0){

			latestMatchPlayers = await playerManager.getAllInMatch(matchesData[0].id);

			const playerFaces = [];

			for(let i = 0; i < latestMatchPlayers.length; i++){

				if(playerFaces.indexOf(latestMatchPlayers[i].face) === -1){
					playerFaces.push(latestMatchPlayers[i].face);
				}
			}

			latestFaces = await faceManager.getFacesWithFileStatuses(playerFaces);

			const latestMapName = Functions.cleanMapName(matchesData[0].mapName).toLowerCase();

			if(mapImages.indexOf(latestMapName) !== -1){
				latestMatchImage = latestMapName;
			}
		}
	}

	await Analytics.insertHit(session.userIp, req.headers.host, req.headers['user-agent']);

	return { props: { 
			"pageSettings": JSON.stringify(pageSettings),
			"navSettings": JSON.stringify(navSettings),
			"session": JSON.stringify(session.settings),
			"host": req.headers.host,
			"matchesData": JSON.stringify(matchesData),
			"countriesData": JSON.stringify(countryData),
			"totalMatches": totalMatches,
			"firstMatch": firstMatch,
			"lastMatch": lastMatch,
			"totalPlayers": totalPlayers,
			"mapImages": JSON.stringify(mapImages),
			"matchDates": JSON.stringify(matchDates),
			"addictedPlayersData": JSON.stringify(addictedPlayersData),
			"recentPlayersData": JSON.stringify(recentPlayersData),
			"faceFiles": JSON.stringify(faceFiles),
			"mostPlayedMaps": JSON.stringify(mostPlayedMaps),
			"gametypeStats": JSON.stringify(gametypeStats),
			"mostUsedFaces": JSON.stringify(mostUsedFaces),
			"query": query,
			"gametypeImages": JSON.stringify(gametypeImages),
			"latestMatchPlayers": JSON.stringify(latestMatchPlayers),
			"latestMatchImage": JSON.stringify(latestMatchImage),
			"latestFaces": JSON.stringify(latestFaces)
			//"countryNames": JSON.stringify(countryNames)
	 	} 
	}
}

export default Home;

