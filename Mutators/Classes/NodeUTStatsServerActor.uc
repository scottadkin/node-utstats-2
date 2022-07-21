//=============================================================================
// NodeUTStatsServerActor.
//=============================================================================
class NodeUTStatsServerActor expands Actor;


function PostBeginPlay(){

    Log( "===============Adding NODEUTStats mutator=========================" );
	Level.Game.BaseMutator.AddMutator(Level.Game.Spawn( class 'NodeUTStatsMutator' ) );

  	Destroy();
}

defaultproperties
{
}
