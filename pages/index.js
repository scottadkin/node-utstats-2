import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Nav from '../components/nav'
import Footer from '../components/footer';
import Servers from '../api/servers';
import ServerBox from '../components/serverbox'


function Home({servers}) {

  console.log(`servers`);
  console.log(servers);

   servers = JSON.parse(servers);
  const elems = [];

  for(let i = 0; i < servers.length; i++){

    elems.push(

      <ServerBox key={servers[i].id} data={servers[i]} />
    );
  }

  return (
    <div>
      <Head>
        <title>Node UTStats</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
     
      <main>
        <Nav />
        <div id={styles.content}>
          content
          {elems}
        </div>
        <Footer />
      </main>   
    </div>
  )
}

// This gets called on every request
export async function getStaticProps() {
  // Fetch data from external API

  const s = new Servers();

  let potatoes = await s.debugGetAllServers();
  let servers = JSON.stringify(potatoes);

  // Pass data to the page via props
  return { props: { servers } }
}

export default Home;

/**
 <main className={styles.main}>
        <Nav />
        <div id={styles.ff}>
          FARTAT
        </div>
        
      </main>
 */