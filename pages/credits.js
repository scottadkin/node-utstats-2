import Link from 'next/link';
import DefaultHead from '../components/defaulthead'
import Nav from '../components/Nav/'
import Footer from '../components/Footer/'

function Credits(props){

    return (
        <div>
            <DefaultHead />
            
            <main>
            <Nav />
            <div id="content">
                <div className="default">
                <div className="default-header">
                    Credits
                </div>

                Country Flags from <a href="https://github.com/hjnilsson/country-flags">https://github.com/hjnilsson/country-flags</a>
                </div>
            </div>
            <Footer />
            </main>   
        </div>
    );
}


/*export async function getServerSideProps(){


    return {
        props: {
            players
        }
    }
}*/


export default Credits;