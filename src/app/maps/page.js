import Nav from "../UI/Nav";
import SiteSettings from "../../../api/sitesettings"
import Session from "../../../api/session";
import { headers, cookies } from "next/headers";
import SearchForm from "../UI/Maps/SearchForm";
import { mapSearch, validSearchOptions } from "../../../api/maps";
import { convertTimestamp, removeUnr, sanatizePage, sanatizePerPage, toPlaytime } from "../../../api/generic.mjs";
import MapDefaultBox from "../UI/Maps/MapDefaultBox";
import Pagination from "../UI/Pagination";
import {BasicTable} from "../UI/Tables";

function setQueryValues(params, searchParams){

	console.log(params);
	console.log(searchParams);

	let name = searchParams.name ?? "";
	let page = searchParams.page ?? 1;
	let order = searchParams.order ?? "asc";
	let perPage = searchParams.perPage ?? 25;
	let sort = searchParams.sort ?? "name";
	let display = searchParams.display ?? "normal";

	page = sanatizePage(page);
	if(page < 1) page = 1;
	perPage = sanatizePerPage(perPage);
	sort = sort.toLowerCase();
	display = display.toLowerCase();

	return {name, page, order, perPage, sort, display};
}

export async function generateMetadata({ params, searchParams }, parent) {

	return {
		"title": `Maps - Node UTStats 2`,
		"description": "Search for a map that's been played on our servers.",
		"keywords": ["Maps"],
	}
}


function renderNormalView(mode, data){

	if(mode !== "normal") return null;

	return <>{data.map((d, i) =>{
		return <MapDefaultBox key={i} data={d}/>
	})}</>;
}

function renderTableView(mode, data){

	if(mode !== "table") return null;

	const headers = [
		"Name", "First Match", "Last Match", "Playtime", "Matches"
	];

	const styles = ["text-left", "playtime", "playtime", "playtime", null];

	const rows = [];

	for(let i = 0; i < data.length; i++){

		const d = data[i];

		rows.push([
			removeUnr(d.name),
			convertTimestamp(d.first),
			convertTimestamp(d.last),
			toPlaytime(d.playtime),
			d.matches
		]);
	}

	return <BasicTable width={1} headers={headers} rows={rows} columnStyles={styles}/>;
}


export default async function Page({params, searchParams}){
   
	params = await params;
	searchParams = await searchParams;

	const {name, page, order, perPage, sort, display} = setQueryValues(params, searchParams);

	const cookieStore = await cookies();
	const header = await headers();
	const cookiesData = cookieStore.getAll();


	const ip = (header.get('x-forwarded-for') ?? '127.0.0.1').split(',')[0]
	
	const session = new Session(ip, JSON.stringify(cookiesData));

	await session.load();
	const siteSettings = new SiteSettings();
	const navSettings = await siteSettings.getCategorySettings("Navigation");
	const sessionSettings = JSON.stringify(session.settings);


	const result = await mapSearch(page, perPage, name, order === "asc", sort);

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content"> 
			<div className="default m-bottom-25">
				<div className="default-header">Maps</div>	
				<SearchForm validOptions={validSearchOptions} name={name} page={page} order={order} 
				perPage={perPage} sort={sort} display={display}/>
			</div>	
			<div className="default">
			{renderNormalView(display, result.data)}
			{renderTableView(display, result.data)}
			
			<Pagination 
				results={result.totalResults} 
				perPage={perPage} 
				currentPage={page} 
				url={`/maps?name=${name}&sort=${sort}&order=${order}&display=${display}&perPage=${perPage}&page=`}	
			/>
			</div>
		</div>  
    </main>; 
}