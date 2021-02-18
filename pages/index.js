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
import Player from '../api/player';

function Home({matchesData, countriesData, totalMatches, firstMatch, lastMatch, totalPlayers, mapImages}) {

  //console.log(`servers`);
	const elems = [];
	const matchElems = [];

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
				</div>
				<div className="default">
					<div className="default-header">
						General Statistics
					</div>
					<GeneralStatistics totalMatches={totalMatches} firstMatch={firstMatch} lastMatch={lastMatch} totalPlayers={totalPlayers}/>
				</div>
				<div className="default">
					<div className="default-header">Recent Matches</div>
					<MatchesDefaultView images={mapImages} data={matchesData} />
				</div>
				<div className="default">
					<div className="default-header">
						Recent Players
					</div>
					fasoi hfoaishf ihasofi aoihf oaisfosha
				</div>
				<div className="default">
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

	const mapIds = Functions.getUniqueValues(matchesData, 'map');
	const gametypeIds = Functions.getUniqueValues(matchesData, 'gametype');
	const serverIds = Functions.getUniqueValues(matchesData, 'server');

	const mapNames = await mapManager.getNames(mapIds);
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

	return { props: { 
			"matchesData": JSON.stringify(matchesData),
			"countriesData": JSON.stringify(countryData),
			"totalMatches": totalMatches,
			"firstMatch": firstMatch,
			"lastMatch": lastMatch,
			"totalPlayers": totalPlayers,
			"mapImages": JSON.stringify(mapImages)
			//"countryNames": JSON.stringify(countryNames)
	 	} 
	}
}

export default Home;

