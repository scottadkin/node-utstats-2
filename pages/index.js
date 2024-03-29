import DefaultHead from "../components/defaulthead"
import Nav from "../components/Nav/"
import Footer from "../components/Footer/";
import Matches from "../api/matches";
import MatchesDefaultView from "../components/MatchesDefaultView/";
import Functions from "../api/functions";
import Maps from "../api/maps";
import Gametypes from "../api/gametypes";
import Servers from "../api/servers";
import PopularCountries from "../components/PopularCountries/";
import Players from "../api/players";
import React from "react";
import BasicPlayers from "../components/BasicPlayers/";
import Faces from "../api/faces";
import HomeTopMaps from "../components/HomeTopMaps/";
import HomeMostPlayedGametypes from "../components/HomeMostPlayedGametypes/";
import MostUsedFaces from "../components/MostUsedFaces/";
import Session from "../api/session";
import SiteSettings from "../api/sitesettings";
import MatchesTableView from "../components/MatchesTableView/";
import Screenshot from "../components/Screenshot";
import Analytics from "../api/analytics";
import NotificationSmall from "../components/NotificationSmall";
import HomeGeneralStats from "../components/HomeGeneralStats";


function Home({navSettings, pageSettings, pageOrder, session, host, matchesData, mapImages,
	addictedPlayersData, recentPlayersData, faceFiles, mostPlayedMaps, gametypeStats, mostUsedFaces, query, gametypeImages, 
	latestMatchPlayers, latestMatchImage, latestFaces, totalPlayers}) {

	pageSettings = JSON.parse(pageSettings);
	pageOrder = JSON.parse(pageOrder);



	const imageHost = Functions.getImageHostAndPort(host);

	let message = [];

	if(query.loggedin !== undefined){

		message = <NotificationSmall type="pass">
			Successfully Logged In.
		</NotificationSmall>;
	}

	if(query.loggedout !== undefined){

		message = <NotificationSmall type="pass">
			Successfully Logged Out.
		</NotificationSmall>;
	}

	if(query.registered !== undefined){

		<NotificationSmall type="pass">
			Successfully created account.<br/>
			You will have to wait until an admin activates your account before you can login.
		</NotificationSmall>;

	}	


	const elems = [];

	const totalElems = Object.entries(pageOrder).length;

	for(let i = 0; i < totalElems; i++){
		elems.push(null);
	}

	const parsedMatchesData = JSON.parse(matchesData);

	
	if(parsedMatchesData.length > 0){

		if(pageSettings["Display Latest Match"] === "true"){

			const latestMatch = parsedMatchesData[0];
			
			elems[pageOrder["Display Latest Match"]] = <Screenshot 
				key={"match-sshot"} map={latestMatch.mapName} totalTeams={latestMatch.total_teams} players={latestMatchPlayers} 
				image={Functions.getImageUrl(imageHost, `/images/maps/${latestMatchImage}.jpg`)} 
				matchData={JSON.stringify(latestMatch)}
				serverName={latestMatch.serverName} gametype={latestMatch.gametypeName} faces={latestFaces} bHome={true}
				host={imageHost}
			/>;
		}
		


		if(pageSettings["Display Recent Matches"] === "true"){

			elems[pageOrder["Display Recent Matches"]] = <div key={"recent-matches"}>

				<div className="default-header">Recent Matches</div>
				{(pageSettings["Recent Matches Display Type"] === "0") ? <MatchesDefaultView host={imageHost} images={JSON.parse(mapImages)} data={parsedMatchesData} /> : 
				<MatchesTableView data={parsedMatchesData}/> }

			</div>;
		}
	}


	if(pageSettings["Display Recent Matches & Player Stats"] === "true"){
		//elems[pageOrder["Display Recent Matches & Player Stats"]] = <CalendarThing key="player-match-heatmap"/>
		elems[pageOrder["Display Recent Matches & Player Stats"]] = <HomeGeneralStats key="general-stats" />;	
	}
	

	
	if(JSON.parse(gametypeStats).length > 0){
		
		if(pageSettings["Display Most Played Gametypes"] === "true"){

			elems[pageOrder["Display Most Played Gametypes"]] = <HomeMostPlayedGametypes 
				key={"monstplayedgametypes"} 
				host={imageHost} 
				data={gametypeStats} 
				images={JSON.parse(gametypeImages)}
			/>;
		}
	}



	if(JSON.parse(mostPlayedMaps).length > 0){

		if(pageSettings["Display Most Played Maps"] === "true"){
			elems[pageOrder["Display Most Played Maps"]] = <HomeTopMaps key={"maps"} host={imageHost} maps={mostPlayedMaps} images={mapImages}/>;
		}
	}

	if(JSON.parse(recentPlayersData).length > 0){

		if(pageSettings["Display Recent Players"] === "true"){

			elems[pageOrder["Display Recent Players"]] = <BasicPlayers key={"recent-players"} 
				host={imageHost} 
				title="Recent Players" 
				players={recentPlayersData} 
				faceFiles={faceFiles}
			/>;
		}
	}

	if(JSON.parse(addictedPlayersData).length > 0){

		if(pageSettings["Display Addicted Players"] === "true"){

			elems[pageOrder["Display Addicted Players"]] = <BasicPlayers key={"addicted-players"} 
				host={imageHost} 
				title="Addicted Players" 
				players={addictedPlayersData} 
				faceFiles={faceFiles}
			/>;
		}
	}

	if(JSON.parse(mostUsedFaces).length > 0){

		if(pageSettings["Display Most Used Faces"] === "true"){
			elems[pageOrder["Display Most Used Faces"]] = <MostUsedFaces key={"faces"} data={mostUsedFaces} images={faceFiles} host={imageHost}/>;
		}
	}


	if(pageSettings["Display Most Popular Countries"] === "true"){

		elems[pageOrder["Display Most Popular Countries"]] = <PopularCountries key={"countries"} totalPlayers={totalPlayers} settings={pageSettings}/>;
	}
	
	return (
		<div>
		<DefaultHead host={host} title={"Home"} description="Welcome to Node UTStats 2, view various stats for players,matches,maps,records and more!" keywords="home,welcome"/>	
		<main>
			<Nav settings={navSettings} session={session}/>
			
			<div id="content">
				<div className="default">	
				{message}
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
	const pageOrder = await siteSettings.getCategoryOrder("Home");
	const navSettings = await siteSettings.getCategorySettings("Navigation");

	const matchManager = new Matches();
	const mapManager = new Maps();
	const gametypeManager = new Gametypes();
	const serverManager = new Servers();
	const playerManager = new Players();

	let matchesData = [];

	if(pageSettings["Display Recent Matches"] === "true"){
		matchesData = await matchManager.getRecent(0, pageSettings["Recent Matches To Display"], 0, playerManager);
	}

	let mostPlayedMaps = [];

	if(pageSettings["Display Most Played Maps"] === "true"){
		mostPlayedMaps = await mapManager.getMostPlayed(4);
	}

	let mapIds = Functions.getUniqueValues(matchesData, "map");
	const gametypeIds = Functions.getUniqueValues(matchesData, "gametype");
	const serverIds = Functions.getUniqueValues(matchesData, "server");

	let mapNames = await mapManager.getNames(mapIds);
	
	for(let i = 0; i < mostPlayedMaps.length; i++){

		if(mapNames[mostPlayedMaps[i].id] === undefined){
			mapNames[mostPlayedMaps[i].id] = mostPlayedMaps[i].name;
		}
	}

	const gametypeNames = await gametypeManager.getNames(gametypeIds);
	const serverNames = await serverManager.getNames(serverIds);



	Functions.setIdNames(matchesData, mapNames, "map", "mapName");
	Functions.setIdNames(matchesData, gametypeNames, "gametype", "gametypeName");
	Functions.setIdNames(matchesData, serverNames, "server", "serverName");

	const totalMatches = await matchManager.getTotal();
	const firstMatch = await matchManager.getFirst();
	const lastMatch = await matchManager.getLast();
	const totalPlayers = await playerManager.getTotalPlayers();

	let justMapNames = [];

	for(const [ket, value] of Object.entries(mapNames)){
		justMapNames.push(Functions.removeUnr(value));
	}

	const mapImages = await mapManager.getImages(justMapNames);


	let addictedPlayersData = [];
	let recentPlayersData = [];

	if(pageSettings["Display Addicted Players"] === "true"){
		addictedPlayersData = await playerManager.getAddictedPlayers(5);
	}

	if(pageSettings["Display Recent Players"] === "true"){
		recentPlayersData = await playerManager.getRecentPlayers(5);
	}

	let faceIds = Functions.getUniqueValues(addictedPlayersData, "face");

	faceIds = faceIds.concat(Functions.getUniqueValues(recentPlayersData, "face"));

	const faceManager = new Faces();

	let mostUsedFaces = [];

	if(pageSettings["Display Most Used Faces"] === "true"){
		mostUsedFaces = await faceManager.getMostUsed(5);
	}

	faceIds = faceIds.concat(Functions.getUniqueValues(mostUsedFaces, "id"));

	const faceFiles = await faceManager.getFacesWithFileStatuses(faceIds);

	let gametypeStats = [];
	let gametypeImages = [];

	if(pageSettings["Display Most Played Gametypes"] === "true"){

		gametypeStats = await gametypeManager.getMostPlayed(5);

		const imageGametypeNames = [];

		for(let i = 0; i < gametypeStats.length; i++){
	
			imageGametypeNames.push(gametypeStats[i].name.replace(/ /ig,"").replace(/tournament/ig, "").toLowerCase());
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

			if(mapImages[latestMapName] !== undefined){
				latestMatchImage = mapImages[latestMapName];
			}
		}
	}

	await Analytics.insertHit(session.userIp, req.headers.host, req.headers["user-agent"]);
	
	return { props: { 
			"pageSettings": JSON.stringify(pageSettings),
			"pageOrder": JSON.stringify(pageOrder),
			"navSettings": JSON.stringify(navSettings),
			"session": JSON.stringify(session.settings),
			"host": req.headers.host,
			"matchesData": JSON.stringify(matchesData),
			"totalMatches": totalMatches,
			"firstMatch": firstMatch,
			"lastMatch": lastMatch,
			"totalPlayers": totalPlayers,
			"mapImages": JSON.stringify(mapImages),
			"addictedPlayersData": JSON.stringify(addictedPlayersData),
			"recentPlayersData": JSON.stringify(recentPlayersData),
			"faceFiles": JSON.stringify(faceFiles),
			"mostPlayedMaps": JSON.stringify(mostPlayedMaps),
			"gametypeStats": JSON.stringify(gametypeStats),
			"mostUsedFaces": JSON.stringify(mostUsedFaces),
			"query": query,
			"gametypeImages": JSON.stringify(gametypeImages),
			"latestMatchPlayers": JSON.stringify(latestMatchPlayers),
			"latestMatchImage": latestMatchImage,
			"latestFaces": JSON.stringify(latestFaces)
			//"countryNames": JSON.stringify(countryNames)
	 	} 
	}
}

export default Home;

