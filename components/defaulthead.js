import Head from 'next/head'

const DefaultHead = () =>{

    return (
        <Head>
            <title>Node UTStats</title>
            <link rel="icon" href="/favicon.ico" />
            <meta name="description" content="Unreal Tournament stats powered by Next.js" />
            <meta name="keywords" content="ut,ut99,unreal,tournament,stats"/>
            <script src="../js/main.js"></script>
        </Head>    
    );
}

export default DefaultHead;