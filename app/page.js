import SiteSettings from "../api/sitesettings";

export default async function Page(){

    const siteSettings = new SiteSettings();

	const pageSettings = await siteSettings.getCategorySettings("Home");
	const pageOrder = await siteSettings.getCategoryOrder("Home");

    console.log(pageSettings);

    return <div>

        home page
    </div>;
}