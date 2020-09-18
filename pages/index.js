import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Nav from '../components/nav'
import Footer from '../components/footer';

export default function Home() {
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
        </div>
        <Footer />
      </main>
      
      
      
    </div>
  )
}

/**
 <main className={styles.main}>
        <Nav />
        <div id={styles.ff}>
          FARTAT
        </div>
        
      </main>
 */