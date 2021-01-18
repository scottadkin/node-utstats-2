import styles from './Screenshot.module.css'


const Screenshot = ({map, totalTeams, players}) =>{

    return (<div className={styles.wrapper}>
        <div className="default-header">
            Match Screenshot
        </div>
        <div className={styles.content}>
            <canvas id="canvas" className="match-screenshot" data-map={map} data-teams={totalTeams} data-players={players} width="800" height="640">

            </canvas>
        </div>
    </div>);
}

export default Screenshot;