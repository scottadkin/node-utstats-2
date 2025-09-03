import Head from 'next/head';
import Functions from '../api/functions';

const DefaultHead = ({host, title, description, keywords, image, imageType}) =>{

    const router = useRouter();

    if(host === undefined) host = "https://example/com";
    if(title === undefined) title = "Not SET!";
    if(description === undefined) description = "Not SET!";
    if(keywords === undefined){
        keywords = "";
    }else{
        keywords = `${keywords},`;
    }
    if(image === undefined) image = "defaultmap";
    if(imageType === undefined) imageType = "jpg";

    const imageHost = Functions.getImageHostAndPort(host);

    const ogImage = `${imageHost}/images/${image}.${imageType}`;
    const titleString = `${title} - Node UTStats 2`;

    return (
        <Head>
            <title>{titleString}</title>
            <link rel="icon" href="/fav.png" />
            <meta name="description" content={`${description}`} />
            <meta name="keywords" content={`${keywords}ut,unreal,tournament,stats,node`} />
            <meta property="og:title" content={`${title} - Node UTStats 2`} />
            <meta property="og:description" content={`${description}`} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`http://${host}${router.asPath}`} />
            <meta property="og:image:secure_url" content={`https://${host}${ogImage}`} />
            <meta property="og:image" content={`http://${host}${ogImage}`} />
            <meta property="og:site_name" content="Node UTStats 2" />
            <meta name="viewport" content="width=device-width,initial-scale=1"/>
        </Head>    
    );
}

export default DefaultHead;