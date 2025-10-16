import PlayerMonster from './PlayerMonster';

export default function PlayerMonsters({data}){

    if(data.length === 0) return null;

    return <>
        <div className="default-header">Monster Stats</div>
        {data.map((d) =>{
            return <PlayerMonster key={d.monster} stats={d}/>
        })}
    </>
}