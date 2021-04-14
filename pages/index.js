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
import GeneralStatistics from '../components/GeneralStatistics/';
import Players from '../api/players';
import React from 'react';
import Graph from '../components/Graph/';
import BasicPlayers from '../components/BasicPlayers/';
import Faces from '../api/faces';
import HomeTopMaps from '../components/HomeTopMaps/';


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
	
	return {
		"title": ["Matches Past 24 Hours", "Matches Past 7 Days", "Matches Past 28 Days"],
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



function Home({matchesData, countriesData, totalMatches, firstMatch, lastMatch, totalPlayers, mapImages, matchDates,
	addictedPlayersData, recentPlayersData, faceFiles, mostPlayedMaps}) {

	matchDates = JSON.parse(matchDates);

	const graphData = createDatesGraphData(matchDates);

	return (
		<div>
		<DefaultHead />
		
		<main>
			<Nav />
			<div id="content">
				<div className="default">
				<div className="default-header">
					Welcome to Node UTStats 2
				</div>
				Here you can look up information on UT matches and players.
		
				
				<div className="default-header">
					General Statistics
				</div>
				<GeneralStatistics totalMatches={totalMatches} firstMatch={firstMatch} lastMatch={lastMatch} totalPlayers={totalPlayers}/>

				<Graph title={graphData.title} data={JSON.stringify(graphData.data)} text={JSON.stringify(graphData.text)}/>
			
				
				<div className="default-header">Recent Matches</div>
				<MatchesDefaultView images={mapImages} data={matchesData} />
			
				<HomeTopMaps maps={mostPlayedMaps} images={mapImages}/>

				<BasicPlayers title="Recent Players" players={recentPlayersData} faceFiles={faceFiles}/>

				<BasicPlayers title="Addicted Players" players={addictedPlayersData} faceFiles={faceFiles}/>

				
				<div className="default-header">
					Most Popular Countires
				</div>
				<PopularCountries data={countriesData}/>
				
			</div>
			</div>
			<Footer />
		</main>   
		</div>
	)
}


export async function getServerSideProps() {

	const matchManager = new Matches();
	const mapManager = new Maps();
	const gametypeManager = new Gametypes();
	const serverManager = new Servers();
	const countriesM = new CountryManager();
	const playerManager = new Players();

	let matchesData = await matchManager.getRecent(0,4);

	let mostPlayedMaps = await mapManager.getMostPlayed(4);

	console.log(mostPlayedMaps);

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

	const countryData = await countriesM.getMostPopular();

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

	const matchDates = await matchManager.getDatesPlayersInTimeframe(((60 * 60) * 24) * 28);

	const addictedPlayersData = await playerManager.getAddictedPlayers(5);
	const recentPlayersData = await playerManager.getRecentPlayers(5);

	let faceIds = Functions.getUniqueValues(addictedPlayersData, 'face');

	faceIds = faceIds.concat(Functions.getUniqueValues(recentPlayersData, 'face'));

	const faceManager = new Faces();

	const faceFiles = await faceManager.getFacesWithFileStatuses(faceIds);

	return { props: { 
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
			"mostPlayedMaps": JSON.stringify(mostPlayedMaps)
			//"countryNames": JSON.stringify(countryNames)
	 	} 
	}
}

export default Home;

