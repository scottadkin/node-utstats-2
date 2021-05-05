import Head from 'next/head';
import {useRouter} from 'next/router';

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

    // <meta property="og:image:secure_url" content={`https://${host}/images/${image}.jpg`} />
    return (
        <Head>
            <title>{title} - Node UTStats 2</title>
            <link rel="icon" href="/favicon.ico" />
            <meta name="description" content={`${description} Node UTStats 2 powered by Next.js.`} />
            <meta name="keywords" content={`${keywords}ut,unreal,tournament,stats,node`} />
            <meta property="og:title" content={`${title} - Node UTStats 2`} />
            <meta property="og:description" content={`${description} Node UTStats 2 powered by Next.js.`} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={`https://${host}${router.asPath}`} />
            <meta property="og:image" content={`http://${host}/images/${image}.${imageType}`} />
           
            <script src="../js/main.js"></script>
        </Head>    
    );
}

export default DefaultHead;