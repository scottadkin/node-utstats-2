import Head from 'next/head';
import {useRouter} from 'next/router';

const ClassicHead = ({host, title, description, keywords, image, imageType}) =>{

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

    // <meta property="og:image:secure_url" content={`https://${host}/images/${image}.jpg`} />
    return (
        <Head>
            <title>{title} - Node UTStats 2</title>
            <link rel="icon" href="/fav.png" />
            <meta name="description" content={`${description} Node UTStats 2 (Classic Support)`} />
            <meta name="keywords" content={`${keywords}ut,unreal,tournament,stats,node,classic`} />
            <meta property="og:title" content={`${title} - Node UTStats 2 (Classic Support)`} />
            <meta property="og:description" content={`${description} Node UTStats 2 (Classic Support)`} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`https://${host}${router.asPath}`} />
            <meta property="og:image" content={`http://${host}/images/${image}.${imageType}`} />
            <meta property="og:site_name" content="Node UTStats 2 Classic Support" />
        
        </Head>    
    );
}

export default ClassicHead;