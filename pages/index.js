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

function Home({matchesData, countriesData}) {

  //console.log(`servers`);
	const elems = [];
	const matchElems = [];


	console.log(countriesData);

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
					total matches total players ect, alst 24 last week ,,,
				</div>
				<div className="default">
					<div className="default-header">Recent Matches</div>
					<MatchesDefaultView images={"[]"} data={matchesData}/>
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

	console.log(mapNames);
	console.log(matchesData[0]);

	for(let i = 0; i < countryData.length; i++){

		countryData[i]['name'] = Countries(countryData[i].code).country;
	}

	return { props: { 
			"matchesData": JSON.stringify(matchesData),
			"countriesData": JSON.stringify(countryData),
			//"countryNames": JSON.stringify(countryNames)
	 	} 
	}
}

export default Home;

