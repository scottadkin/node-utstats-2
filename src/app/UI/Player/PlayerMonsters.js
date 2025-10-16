import PlayerMonster from './PlayerMonster';

export default function PlayerMonsters({data}){

    return <>
        <div className="default-header">Monster Stats</div>
        {data.map((d) =>{
            return <PlayerMonster key={d.monster} stats={d}/>
        })}
    </>
}