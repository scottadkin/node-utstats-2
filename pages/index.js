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

function createDatesGraphData(data){

	let hours = Functions.createDateRange(24, 0);
	let week = Functions.createDateRange(7, 0);
	let month = Functions.createDateRange(28, 0);

	let hoursPlayers = Functions.createDateRange(24, 0);
	let weekPlayers = Functions.createDateRange(7, 0);
	let monthPlayers = Functions.createDateRange(28, 0);

	let totalDay = 0;
	let totalDayPlayers = 0;
	let totalWeek = 0;
	let totalWeekPlayers = 0;
	let totalMonth = 0;
	let totalMonthPlayers = 0;

	let dayText = [];
	let weekText = [];
	let monthText = [];

	const hourDiff = 60 * 60;
	const dayDiff = hourDiff * 24;


	let d = 0;
	const now = Math.floor(Date.now() * 0.001);
	let diff = 0;

	let currentHourDiff = 0;
	let currentDayDiff = 0;

	for(let i = 0; i < data.length; i++){

		d = data[i];

		diff = now - d.date;

		currentHourDiff = Math.floor(diff / hourDiff);
		currentDayDiff = Math.floor(diff / dayDiff);

		if(currentHourDiff < 24){

			hours[currentHourDiff]++;
			hoursPlayers[currentHourDiff] += d.players;
			totalDay++;
			totalDayPlayers += d.players;
			dayText.push(
				`Hour ${i} to ${i + 1}`
			);
		}

		if(currentDayDiff < 7){

			week[currentDayDiff]++;
			weekPlayers[currentDayDiff] += d.players;
			totalWeek++;
			totalWeekPlayers += d.players;
			weekText.push(
				`Day ${i} to ${i + 1}`
			);
		}

		if(currentDayDiff < 28){

			month[currentDayDiff]++;
			monthPlayers[currentDayDiff] += d.players;
			totalMonth++;
			totalMonthPlayers += d.players;
			monthText.push(
				`Day ${i} to ${i + 1}`
			);
		}
	}

	if(totalDay === 0) hours = [];
	if(totalDayPlayers === 0) hoursPlayers = [];
	if(totalWeek === 0) week = [];
	if(totalWeekPlayers === 0) weekPlayers = [];
	if(totalMonth === 0) month = [];
	if(totalMonthPlayers === 0) monthPlayers = [];

	if(hours.length === 0 && week.length === 0 && month.length === 0 && hoursPlayers.length === 0 &&
		 weekPlayers.length === 0 && monthPlayers.length === 0){

			return null;
	}
	
	return {
		"title": ["Stats Past 24 Hours", "Stats Past 7 Days", "Stats Past 28 Days"],
		"data": [
			[{"name": "Matches", "data": hours}, {"name": "Players", "data": hoursPlayers}],
			[{"name": "Matches", "data": week}, {"name": "Players", "data": weekPlayers}],
			[{"name": "Matches", "data": month}, {"name": "Players", "data": monthPlayers}],
		],
		"text": [
			dayText,
			weekText,
			monthText
		]
	};

}



function Home({navSettings, pageSettings, session, host, matchesData, countriesData, mapImages, matchDates,
	addictedPlayersData, recentPlayersData, faceFiles, mostPlayedMaps, gametypeStats, mostUsedFaces, query, gametypeImages}) {

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

	if(JSON.parse(matchesData) > 0){

		if(pageSettings["Display Recent Matches"] === "true"){

			elems.push(<div key={"recent-matches"}>

				<div className="default-header">Recent Matches</div>
			
				{(pageSettings["Recent Matches Display Type"] == "0") ? <MatchesDefaultView images={mapImages} data={matchesData} /> : 
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

			elems.push(<div key={"countries"}>
				<div className="default-header">
					Most Popular Countries
				</div>
				<PopularCountries data={countriesData}/>
			</div>);
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
				<div id="welcome-text">Here you can look up information on UT matches, players, and maps.</div>

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

	console.log(pageSettings);
	console.log(navSettings);

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


	const imageGametypeNames = [];

	for(const [key, value] of Object.entries(gametypeNames)){

		imageGametypeNames.push(value.replace(/ /ig,'').toLowerCase());
	}

	const gametypeImages = gametypeManager.getMatchingImages(imageGametypeNames, false);
	
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

	let matchDates = [];

	if(pageSettings["Display Recent Matches & Player Stats"] === "true"){
		matchDates = await matchManager.getDatesPlayersInTimeframe(((60 * 60) * 24) * 28);
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

	if(pageSettings["Display Most Played Gametypes"] === "true"){
		gametypeStats = await gametypeManager.getMostPlayed(5);
	}

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
			"gametypeImages": JSON.stringify(gametypeImages)
			//"countryNames": JSON.stringify(countryNames)
	 	} 
	}
}

export default Home;

