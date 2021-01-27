import styles from './Screenshot.module.css'



const Screenshot = ({map, totalTeams, players, image, matchData}) =>{

    return (<div className={`${styles.wrapper} center`}>
        <div className="default-header">
            Match Screenshot
        </div>
        <div className={`${styles.content} center`}>
            <canvas id="canvas" className="match-screenshot center" 
                data-match-data={matchData} 
                data-map={map} 
                data-image={image}
                data-teams={totalTeams} 
                data-players={players} 
                width="1920" height="1080">
            </canvas>
        </div>
    </div>);
}

export default Screenshot;