class NodeUTStatsMutator expands Mutator config(NodeUTStats2);

var config bool bLogSpawnPoints;
var config bool bLogWeaponLocations;
var config bool bLogAmmoLocations;
var config bool bLogHealthLocations;
var config bool bLogPickupLocations;
var config bool bLogFlagLocations;
var config bool bLogDomLocations;
var config bool bLogKillDistances;
var config bool bLogFlagKills;
var config bool bLogMonsterKills;

var (NodeUTStats) string faces[39];

struct nPlayer{
	var PlayerReplicationInfo p;
	var Pawn pawn;
	var int spawns;
	var float lastSpawnTime;
	var int id;
	var int monsterKills;
	var int previousScore;
	var int headshots;
};


var nPlayer nPlayers[64];


struct flagInfo{

	var float x;
	var float y;
	var float z;
	var int team;
};



var flagInfo nFlags[4];

struct spawnInfo{
	var float x;
	var float y;
	var float z;
	var bool bUsed;
};


var spawnInfo nSpawns[255]; 


function printLog(string s){

	Level.Game.LocalLog.LogEventString(Level.Game.LocalLog.GetTimeStamp() $ Chr(9) $ s);
}


function int getPlayerIndex(PlayerReplicationInfo p){

	local int i;

	for(i = 0; i < 64; i++){

		if(nPlayers[i].id == p.PlayerID){
			return i;
		}
	}

	return -1;
}


function string getRandomFace(){
	
	local int currentIndex;

	currentIndex = Rand(38);

	return faces[currentIndex];
	
}

function int insertNewPlayer(Pawn p){
	
	local int i;

	for(i = 0; i < 64; i++){
		
		if(nPlayers[i].id == -1){

			nPlayers[i].p = p.PlayerReplicationInfo;
			nPlayers[i].id = p.PlayerReplicationInfo.PlayerID;

			if(nPlayers[i].p.TalkTexture != None){
				printLog("nstats"$Chr(9)$"Face"$Chr(9)$nPlayers[i].p.PlayerID$Chr(9)$nPlayers[i].p.TalkTexture);
			}else{
				printLog("nstats"$Chr(9)$"Face"$Chr(9)$nPlayers[i].p.PlayerID$Chr(9)$getRandomFace());
			}

			if(nPlayers[i].p.VoiceType != None){
				printLog("nstats"$Chr(9)$"Voice"$Chr(9)$nPlayers[i].p.PlayerID$Chr(9)$nPlayers[i].p.VoiceType);
			}

			
		
			return i;
		}
	}

	return -1;
}


function updateSpawnInfo(int offset){
		
	nPlayers[offset].spawns++;
	nPlayers[offset].lastSpawnTime = Level.TimeSeconds;

}


function initFlags(){

	local int i;

	for(i = 0; i < 4; i++){

		nFlags[i].team = -1;
		nFlags[i].x = 0;
		nFlags[i].y = 0;
		nFlags[i].z = 0;
	}
}

function LogFlagLocations(){

	local FlagBase currentFlag;
	local string position;

	initFlags();

	foreach AllActors(class'FlagBase', currentFlag){

		if(currentFlag.team >= 0 && currentFlag.team <= 3){

			nFlags[currentFlag.team].team = currentFlag.team;
			nFlags[currentFlag.team].x = currentFlag.Location.x;
			nFlags[currentFlag.team].y = currentFlag.Location.y;
			nFlags[currentFlag.team].z = currentFlag.Location.z;
		}

		position = currentFlag.Location.x $ Chr(9) $ currentFlag.Location.y $ Chr(9) $ currentFlag.Location.z;
		printLog("nstats" $Chr(9)$ "flag_location" $Chr(9)$ currentFlag.team $ Chr(9) $ position);
	}
}

function int addSpawnPoint(float x, float y, float z){

	local int i;
	//local string currentSpawn;

	for(i = 0; i < 255; i++){

		//currentSpawn = spawns[i];
		if(!nSpawns[i].bUsed){

			nSpawns[i].x = x;
			nSpawns[i].y = y;
			nSpawns[i].z = z;
			nSpawns[i].bUsed = true;
			return i;
		}
	}

	return -1;
}


function int getSpawnId(float x, float y, float z){
	
	local int i;

	for(i = 0; i < 255; i++){

		if(nSpawns[i].x == x && nSpawns[i].y == y && nSpawns[i].z == z){	
			return i;
		}
		
		//test fix for playerstarts that are in the air
		
		if(nSpawns[i].x == x && nSpawns[i].y == y){
			return i;
		}

		if(!nSpawns[i].bUsed){
			return -1;
		}

	}	

	return -1;
}


function LogSpawnLocations(){

	local PlayerStart s;
	local string position;
	local int spawnIndex;

	foreach AllActors(class'PlayerStart', s){

		spawnIndex = addSpawnPoint(s.Location.x, s.Location.y, s.Location.z);

		//spawnIndex = addSpawnPoint(s.Location.x, s.Location.y, s.Location.z);

		position = s.Location.x $","$ s.Location.y $","$ s.Location.z;
		printLog("nstats" $Chr(9)$ "spawn_point" $Chr(9)$ s.Name $Chr(9)$ s.TeamNumber $Chr(9)$ position $Chr(9)$ spawnIndex);
		
	}
}

function LogWeaponLocations(){


	local TournamentWeapon w;
	local string position;


	foreach AllActors(class'TournamentWeapon', w){
		
		position = w.Location.x $ ","$ w.Location.y $ "," $ w.location.z;		
		printLog( "nstats" $Chr(9)$ "weapon_location" $Chr(9)$ w.class $ Chr(9) $ w.Name $ Chr(9) $ position);
	}
}

function LogHealthLocations(){

	local TournamentHealth h;
	local string position;

	foreach AllActors(class'TournamentHealth', h){
		
		position = h.Location.x $ "," $ h.location.y $ "," $ h.location.z;
		printLog("nstats" $ Chr(9) $ "pickup_location" $ Chr(9) $ h.class $ Chr(9) $ h.Name $ Chr(9) $ position);
	}
}

function LogPickupLocations(){

	local TournamentPickup p;
	local string position;

	foreach AllActors(class'TournamentPickup', p){
		
		position = p.Location.x $ "," $p.location.y $ "," $ p.location.z;
		printLog("nstats" $ Chr(9) $ "pickup_location" $ Chr(9) $ p.class $ Chr(9) $ p.Name $ Chr(9) $ position);
	}
}


function LogAmmoLocations(){

	local TournamentAmmo a;
	local string position;

	foreach AllActors(class'TournamentAmmo', a){
		
		position = a.Location.x$","$a.location.y$","$a.location.z;
		
		printLog("nstats" $ Chr(9) $ "ammo_location" $ Chr(9) $ a.class $ Chr(9) $ a.name $ Chr(9) $ position);

	}
}

function LogPlayerScores(){

	local PlayerReplicationInfo p;

	local int currentIndex;
	
	foreach AllActors(class'PlayerReplicationInfo', p){
	
		currentIndex = getPlayerIndex(p);
		
		if(currentIndex != -1){
		
			if(nPlayers[currentIndex].previousScore != p.score){
				nPlayers[currentIndex].previousScore = p.score;
				printLog("nstats" $ Chr(9) $ "p_s" $ Chr(9) $ p.PlayerId $ Chr(9) $ int(p.score));
			}
		}
	}


}

function Timer(){
	
	LogPlayerScores();
	
}

function PostBeginPlay(){

	local int i;
	

	LOG("¬¬¬¬¬¬¬¬¬¬¬¬¬¬¬ NodeUTStats started ¬¬¬¬¬¬¬¬¬¬¬¬¬¬¬");


	if(bLogSpawnPoints){
		LogSpawnLocations();
	}
	
	if(bLogFlagLocations){
		LogFlagLocations();
	}

	if(bLogWeaponLocations){
		LogWeaponLocations();
	}

	if(bLogHealthLocations){
		LogHealthLocations();

	}

	if(bLogPickupLocations){
		LogPickupLocations();
	}

	if(bLogAmmoLocations){
		LogAmmoLocations();

	}

	if(bLogDomLocations){
		LogDomPoints();
	}

	for(i = 0; i < 64; i++){
	
		nPlayers[i].id = -1;
		nPlayers[i].lastSpawnTime = -1;
	}
	
	setTimer(15.0, True);
		
}



function bool HandleEndGame(){


	LogPlayerScores();
	
	if(NextMutator != None){
		return NextMutator.HandleEndGame();
	}

	return false;
}





function LogKillDistance(Pawn Killer, Pawn Other){

	local float distance;
	local int killerId;
	local int otherId;
	local string killerLocation;
	local string victimLocation;

	if(Killer.PlayerReplicationInfo != None && Other.PlayerReplicationInfo != None){

		killerId = Killer.PlayerReplicationInfo.PlayerID;
		otherId = Other.PlayerReplicationInfo.PlayerID;

		distance = VSize(Killer.Location - Other.Location);

		killerLocation = killerId $ Chr(9) $ Killer.Location.x $ "," $ Killer.Location.y $ "," $ Killer.Location.z;
		victimLocation = otherId $ Chr(9) $ Other.Location.x $ "," $ Other.Location.y $ "," $ Other.Location.z;

		printLog("nstats" $Chr(9)$ "kill_distance" $Chr(9)$ distance $Chr(9)$ killerId $Chr(9)$ otherId);
		printLog("nstats" $Chr(9)$ "kill_location" $Chr(9) $  killerLocation $ Chr(9) $ victimLocation);
	}
}


function flagInfo getFlag(int team){

	return nFlags[team];

}

function vector getFlagBaseLocation(int team){

	local flagInfo redFlag;
	local flagInfo blueFlag;
	local vector currentLocation;

	redFlag = getFlag(0);
	blueFlag = getFlag(1);

	if(team == 0){
		
		currentLocation.x = redFlag.x;// = [redFlag.x, redFlag.y, redFlag.z];
		currentLocation.y = redFlag.y;
		currentLocation.z = redFlag.z;

	}else if(team == 1){
	
		currentLocation.x = blueFlag.x;
		currentLocation.y = blueFlag.y;
		currentLocation.z = blueFlag.z;
	}


	return currentLocation;
}

function LogFlagKill(Pawn Killer, Pawn Victim){

	local float distanceToCap;
	local float distanceToBase;
	local float killDistance;
	local vector myBase;
	local vector enemyBase;
	local int victimTeam;

	victimTeam = Victim.PlayerReplicationInfo.team;

	killDistance = VSize(Killer.Location - Victim.Location);

	
	if(victimTeam == 0){
		myBase = getFlagBaseLocation(0);
		enemyBase = getFlagBaseLocation(1);
	}else{
		myBase = getFlagBaseLocation(1);
		enemyBase = getFlagBaseLocation(0);		
	}

	distanceToBase = VSize(Victim.Location - myBase);
	distanceToCap = VSize(Victim.Location - enemyBase);

	printLog("nstats"$Chr(9)$"flag_kill"$Chr(9)$ Killer.PlayerReplicationInfo.PlayerId $Chr(9)$ Victim.PlayerReplicationInfo.PlayerId $Chr(9) $ killDistance $ Chr(9) $ distanceToBase $ Chr(9) $ distanceToCap);
}


function logDomPoints(){

	local ControlPoint p;

	foreach AllActors(class'ControlPoint', p){
	
		printLog("nstats"$Chr(9)$"dom_point"$Chr(9)$ p.PointName $Chr(9)$ p.Location.x $","$ p.Location.y $","$ p.Location.z);
	}
}


function ScoreKill(Pawn Killer, Pawn Other){

	local int KillerId, OtherId;	
	
	if(Killer != None){

		if(Killer.PlayerReplicationInfo != None){

			KillerId = getPlayerIndex(Killer.PlayerReplicationInfo);

			if(bLogKillDistances){
				LogKillDistance(Killer, Other);
			}
	
			//check if victim is a monster
			if(!Other.IsA('PlayerPawn') && !Other.IsA('HumanBotPlus')){
				printLog("nstats"$Chr(9)$"MonsterKill"$Chr(9)$Killer.PlayerReplicationInfo.PlayerID$Chr(9)$Other.Class);
			}

		}else{
		
			KillerId = -1;
		}
	}

	if(Other != None){

		if(Other.PlayerReplicationInfo != None){	
			OtherId = getPlayerIndex(Other.PlayerReplicationInfo);
		}else{
			OtherId = -1;
		}
	}


	if(OtherId != -1){
		//nPlayers[OtherId]
	}

	if(NextMutator != None){
		NextMutator.ScoreKill(Killer, Other);
	}

}



function LogSpawnLocation(Pawn Other){

	local int spawnIndex;

	if(Other.PlayerReplicationInfo != None && Other.bIsPlayer){

		spawnIndex = getSpawnId(Other.Location.x, Other.Location.y, Other.Location.z);
		printLog("nstats"$Chr(9)$"spawn_loc"$Chr(9)$Other.PlayerReplicationInfo.PlayerID$Chr(9)$spawnIndex);
	
	}
}



function ModifyPlayer(Pawn Other){

	local int currentPID;

	if(Other.PlayerReplicationInfo != None && Other.bIsPlayer){

		if(bLogSpawnPoints){
			LogSpawnLocation(Other);
		}
			
		currentPID = getPlayerIndex(Other.PlayerReplicationInfo);

		if(currentPID == -1){
			currentPID = InsertNewPlayer(Other);
		}	
	
		if(currentPID != -1){
			updateSpawnInfo(currentPID);
		}
	}

	if (NextMutator != None)
      NextMutator.ModifyPlayer(Other);
}


function bool PreventDeath(Pawn Killed, Pawn Killer, name damageType, vector HitLocation){

	local class KillerClass;
	
	if(Killer != None){
	
		if(Killer.PlayerReplicationInfo == None && Killed.PlayerReplicationInfo != None){						if(Killer != None){				KillerClass = Killer.class;			}else{				KillerClass = Killed.class;			}					printLog( "nstats" $Chr(9)$ "mk" $Chr(9)$ KillerClass $ Chr(9) $ Killed.PlayerReplicationInfo.PlayerID);		}
	}

	if(bLogFlagKills){
	
		if(Killed.PlayerReplicationInfo != None){

			if(Killed.PlayerReplicationInfo.HasFlag != None){
			
				if(Killer != None){
					logFlagKill(Killer, Killed);
				}else{
					logFlagKill(Killed, Killed);
				}
			}
		}
	}

	if ( NextMutator != None )
		return NextMutator.PreventDeath(Killed,Killer, damageType,HitLocation);
	return false;
}

defaultproperties
{
      bLogSpawnPoints=True
      bLogWeaponLocations=True
      bLogAmmoLocations=True
      bLogHealthLocations=True
      bLogPickupLocations=True
      bLogFlagLocations=True
      bLogDomLocations=True
      bLogKillDistances=True
      bLogFlagKills=True
      bLogMonsterKills=True
      Faces(0)="soldierskins.hkil5vector"
      Faces(1)="soldierskins.blkt5malcom"
      Faces(2)="commandoskins.goth5grail"
      Faces(3)="soldierskins.sldr5johnson"
      Faces(4)="fcommandoskins.daco5jayce"
      Faces(5)="fcommandoskins.goth5visse"
      Faces(6)="commandoskins.daco5graves"
      Faces(7)="sgirlskins.venm5sarena"
      Faces(8)="soldierskins.raws5kregore"
      Faces(9)="sgirlskins.army5sara"
      Faces(10)="sgirlskins.garf5vixen"
      Faces(11)="commandoskins.daco5boris"
      Faces(12)="commandoskins.daco5luthor"
      Faces(13)="commandoskins.cmdo5blake"
      Faces(14)="commandoskins.daco5ramirez"
      Faces(15)="fcommandoskins.daco5kyla"
      Faces(16)="soldierskins.sldr5brock"
      Faces(17)="commandoskins.goth5kragoth"
      Faces(18)="sgirlskins.venm5cilia"
      Faces(19)="fcommandoskins.goth5freylis"
      Faces(20)="sgirlskins.garf5isis"
      Faces(21)="fcommandoskins.daco5tanya"
      Faces(22)="sgirlskins.army5lauren"
      Faces(23)="soldierskins.blkt5riker"
      Faces(24)="soldierskins.sldr5rankin"
      Faces(25)="soldierskins.blkt5othello"
      Faces(26)="fcommandoskins.goth5cryss"
      Faces(27)="fcommandoskins.daco5mariana"
      Faces(28)="soldierskins.raws5arkon"
      Faces(29)="commandoskins.cmdo5gorn"
      Faces(30)="fcommandoskins.goth5malise"
      Faces(31)="sgirlskins.fbth5annaka"
      Faces(32)="tcowmeshskins.warcowface"
      Faces(33)="bossskins.boss5xan"
      Faces(34)="sgirlskins.fwar5cathode"
      Faces(35)="soldierskins.hkil5matrix"
      Faces(36)="tskmskins.meks5disconnect"
      Faces(37)="fcommandoskins.aphe5indina"
      Faces(38)="soldierskins.hkil5tensor"
      nPlayers(0)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(1)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(2)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(3)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(4)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(5)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(6)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(7)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(8)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(9)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(10)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(11)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(12)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(13)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(14)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(15)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(16)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(17)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(18)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(19)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(20)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(21)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(22)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(23)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(24)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(25)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(26)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(27)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(28)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(29)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(30)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(31)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(32)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(33)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(34)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(35)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(36)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(37)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(38)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(39)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(40)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(41)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(42)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(43)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(44)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(45)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(46)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(47)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(48)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(49)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(50)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(51)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(52)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(53)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(54)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(55)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(56)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(57)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(58)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(59)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(60)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(61)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(62)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nPlayers(63)=(P=None,Pawn=None,spawns=0,lastSpawnTime=0.000000,Id=0,monsterKills=0,previousScore=0,headshots=0)
      nFlags(0)=(X=0.000000,Y=0.000000,Z=0.000000,Team=0)
      nFlags(1)=(X=0.000000,Y=0.000000,Z=0.000000,Team=0)
      nFlags(2)=(X=0.000000,Y=0.000000,Z=0.000000,Team=0)
      nFlags(3)=(X=0.000000,Y=0.000000,Z=0.000000,Team=0)
      nSpawns(0)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(1)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(2)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(3)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(4)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(5)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(6)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(7)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(8)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(9)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(10)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(11)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(12)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(13)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(14)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(15)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(16)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(17)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(18)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(19)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(20)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(21)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(22)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(23)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(24)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(25)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(26)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(27)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(28)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(29)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(30)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(31)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(32)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(33)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(34)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(35)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(36)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(37)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(38)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(39)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(40)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(41)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(42)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(43)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(44)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(45)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(46)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(47)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(48)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(49)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(50)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(51)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(52)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(53)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(54)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(55)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(56)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(57)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(58)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(59)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(60)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(61)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(62)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(63)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(64)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(65)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(66)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(67)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(68)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(69)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(70)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(71)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(72)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(73)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(74)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(75)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(76)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(77)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(78)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(79)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(80)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(81)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(82)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(83)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(84)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(85)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(86)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(87)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(88)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(89)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(90)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(91)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(92)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(93)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(94)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(95)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(96)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(97)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(98)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(99)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(100)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(101)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(102)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(103)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(104)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(105)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(106)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(107)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(108)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(109)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(110)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(111)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(112)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(113)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(114)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(115)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(116)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(117)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(118)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(119)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(120)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(121)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(122)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(123)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(124)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(125)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(126)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(127)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(128)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(129)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(130)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(131)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(132)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(133)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(134)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(135)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(136)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(137)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(138)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(139)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(140)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(141)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(142)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(143)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(144)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(145)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(146)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(147)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(148)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(149)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(150)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(151)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(152)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(153)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(154)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(155)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(156)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(157)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(158)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(159)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(160)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(161)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(162)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(163)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(164)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(165)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(166)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(167)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(168)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(169)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(170)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(171)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(172)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(173)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(174)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(175)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(176)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(177)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(178)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(179)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(180)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(181)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(182)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(183)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(184)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(185)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(186)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(187)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(188)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(189)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(190)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(191)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(192)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(193)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(194)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(195)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(196)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(197)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(198)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(199)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(200)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(201)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(202)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(203)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(204)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(205)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(206)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(207)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(208)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(209)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(210)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(211)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(212)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(213)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(214)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(215)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(216)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(217)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(218)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(219)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(220)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(221)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(222)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(223)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(224)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(225)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(226)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(227)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(228)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(229)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(230)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(231)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(232)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(233)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(234)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(235)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(236)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(237)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(238)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(239)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(240)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(241)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(242)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(243)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(244)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(245)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(246)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(247)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(248)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(249)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(250)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(251)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(252)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(253)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
      nSpawns(254)=(X=0.000000,Y=0.000000,Z=0.000000,bUsed=False)
}
