import Link from 'next/link';
import DefaultHead from '../components/defaulthead'
import Nav from '../components/Nav/'
import Footer from '../components/Footer/'
import Session from '../api/session';
import SiteSettings from '../api/sitesettings';

function Credits({session, navSettings}){

    return (
        <div>
            <DefaultHead />
            
            <main>
            <Nav settings={navSettings} session={session}/>
            <div id="content">
                <div className="default">
                <div className="default-header">
                    Credits
                </div>

                Country Flags from <a href="https://github.com/hjnilsson/country-flags">https://github.com/hjnilsson/country-flags</a><br/>
                Question mark icon made by <a href="https://icon54.com/" title="Pixel perfect">Pixel perfect</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a><br/>
                Thanks to Batonix for useful feedback.
                </div>
            </div>
            <Footer session={session}/>
            </main>   
        </div>
    );
}


export async function getServerSideProps({req}){


    const session = new Session(req.headers.cookie);

	await session.load();

    const settings = new SiteSettings();

    const navSettings = await settings.getCategorySettings("Navigation");

    return {
        props: {
            "session": JSON.stringify(session.settings),
            "navSettings": JSON.stringify(navSettings)
        }
    }
}


export default Credits;