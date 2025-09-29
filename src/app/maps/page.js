import Nav from "../UI/Nav";
import SiteSettings from "../../../api/sitesettings"
import Session from "../../../api/session";
import { headers, cookies } from "next/headers";
import SearchForm from "../UI/Maps/SearchForm";
import { mapSearch, validSearchOptions } from "../../../api/maps";
import { sanatizePage, sanatizePerPage } from "../../../api/generic.mjs";

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


	const data = await mapSearch(page, perPage, name, order === "asc", sort);

    return <main>
        <Nav settings={navSettings} session={sessionSettings}/>		
        <div id="content"> 
			<div className="default">
				<div className="default-header">Maps</div>	
				<SearchForm validOptions={validSearchOptions} name={name} page={page} order={order} 
				perPage={perPage} sort={sort} display={display}/>
			</div>	
		</div>  
    </main>; 
}