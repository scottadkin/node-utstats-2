import styles from './Screenshot.module.css'

//fix screenshot not loading on page back


const Screenshot = ({map, totalTeams, players, image, matchData}) =>{

    return (<div className={`${styles.wrapper} center`}>
        <div className="default-header">
            Match Screenshot
        </div>
        <div className={`${styles.content} center`}>
            <canvas id="m-sshot" className="match-screenshot center" 
                data-match-data={matchData} 
                data-map={map} 
                data-image={image}
                data-teams={totalTeams} 
                data-players={players} 
                width="1920" height="1080">
            </canvas>
            <script dangerouslySetInnerHTML={{__html: `new MatchScreenshot("m-sshot", ${JSON.stringify(image)}, ${JSON.stringify(map)}, ${JSON.stringify(players)}, ${JSON.stringify(totalTeams)}, ${JSON.stringify(matchData)});`}}></script>
        </div>
    </div>);
}

export default Screenshot;