//=============================================================================
// NodeUTStats2Spectator.
//=============================================================================
class NodeUTStats2Spectator expands MessagingSpectator;

function LogEvent(string Message){

	if(Level.Game.LocalLog != None){
		Level.Game.LocalLog.LogEventString(Level.Game.LocalLog.GetTimeStamp() $ Chr(9) $ "nstats" $ Chr(9) $ Message);
	}
}

event ReceiveLocalizedMessage( class<LocalMessage> Message, optional int Switch, optional PlayerReplicationInfo RelatedPRI_1, optional PlayerReplicationInfo RelatedPRI_2, optional Object OptionalObject )
{

	local CTFFlag flag;
	local string currentMessage;
	local TeamInfo tInfo;
	local Pawn Owner;

	
	if(Message == class'CTFMessage'){
	
		/*
		if(Switch == 1){
			
			Owner = PlayerPawn(RelatedPRI_1.Owner);
			flag = CTFFlag(OptionalObject);
			currentMessage = "frl" $ Chr(9) $flag.Team $ Chr(9) $ Owner.Location.x $ "," $ Owner.Location.y $ "," $ Owner.Location.z;
			LogEvent(currentMessage);
		}
		*/
	
		if(Switch == 2){
		
			if(RelatedPRI_1.HasFlag != None){
			
				Owner = PlayerPawn(RelatedPRI_1.Owner);
				flag = CTFFlag(RelatedPRI_1.HasFlag);
				if(Owner != None){
					currentMessage = "fdl" $ Chr(9) $flag.Team $ Chr(9) $ Owner.Location.x $ "," $ Owner.Location.y $ "," $ Owner.Location.z;	
				}
				LogEvent(currentMessage);
			}
		}
		
		/*if(Switch == 3){
			
			flag = CTFFlag(OptionalObject);
			currentMessage = "ftor" $ Chr(9) $flag.Team $ Chr(9) $ flag.Location.x $ "," $ flag.Location.y $ "," $ flag.Location.z;
			LogEvent(currentMessage);
		}*/
	}
}

defaultproperties
{
}
