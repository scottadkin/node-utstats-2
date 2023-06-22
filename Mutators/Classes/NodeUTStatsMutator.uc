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
var config bool bLogACEPlayerHWID;

var int TicksSinceLastScoreLog;
var (NodeUTStats) string faces[39];



struct nPlayer{
	var PlayerReplicationInfo p;
	var Pawn pawn;
	var int spawns;
	var float lastSpawnTime;
	var int id;
	var int previousScore;
	var string HWID;
	var bool bBot;
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

event PreBeginPlay()
{
	Spawn(class'NodeUTStats2Spectator');
}


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
			nPlayers[i].HWID = "";
			nPlayers[i].bBot = p.PlayerReplicationInfo.bIsABot;
			
			

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


function int getPlayerIndexById(int TargetId){

	local int i;
	local nPlayer currentPlayer;
	
	for(i = 0; i < 64; i++){	
		if(nPlayers[i].id == -1) return -1;
		
		if(nPlayers[i].id == TargetId) return i;
			}
	
	return -1;
}



function setPlayerHWID(int PlayerIndex, string HWID){

	local int PlayerId;

	if(nPlayers[PlayerIndex].HWID == "" && HWID != ""){
	
		nPlayers[PlayerIndex].HWID = HWID;	
		PlayerId = nPlayers[PlayerIndex].id; 	
		printLog("nstats" $Chr(9)$ "HWID" $Chr(9) $ PlayerId $Chr(9)$ HWID);	
		return;
	}
	
}


function checkPlayerHWID(int TargetPlayerIndex){
	
	local Actor ACEActor;
	local string HWID;
	local int PlayerId;
	//local int TargetPlayerIndex;	
	local nPlayer TargetPlayer;
	
	
	//TargetPlayerIndex = getPlayerIndexById(PlayerId);
	
	if(TargetPlayerIndex == -1) return;
	
	TargetPlayer = nPlayers[TargetPlayerIndex];
	
	if(TargetPlayer.bBot) return;
	//HWID already set
	if(TargetPlayer.HWID != "") return;
	
	
	foreach AllActors(class'Actor', ACEActor){
	
		if(ACEActor.IsA('IACECheck')){
		
			PlayerId = int(ACEActor.GetPropertyText("PlayerId"));
			
			if(TargetPlayer.id == PlayerId){
				
				HWID = ACEActor.GetPropertyText("HWHash");
				
				setPlayerHWID(TargetPlayerIndex, HWID);
				return;
			}
		}
	}
}


function backupCheckPlayerHWID(){

	local int i;
	local nPlayer currentPlayer;
	
	if(!bLogACEPlayerHWID) return;
	
	for(i = 0; i < 64; i++){
	
		currentPlayer = nPlayers[i];
		
		if(currentPlayer.id == -1) return;
		if(currentPlayer.bBot) continue;
		if(currentPlayer.HWID != "") continue;
		checkPlayerHWID(i);	
	}
}


function Timer(){
	
	LogPlayerScores();
	backupCheckPlayerHWID();
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
	
	setTimer(10.0, True);
		
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
			
			if(bLogACEPlayerHWID && !Other.PlayerReplicationInfo.bIsABot){
				checkPlayerHWID(currentPID);			}
		}
	}

	if (NextMutator != None)
      NextMutator.ModifyPlayer(Other);
}

function LogSuicideLocation(Pawn Victim){

	local string KilledLocation;

		if(Victim.PlayerReplicationInfo != None){
		
			KilledLocation = Victim.PlayerReplicationInfo.PlayerId $ Chr(9) $ Victim.Location.x $ "," $ Victim.Location.y $ "," $ Victim.Location.z;					printLog("nstats" $ Chr(9) $ "suicide_loc" $ Chr(9) $ killedLocation);
		
		}
}


function bool PreventDeath(Pawn Killed, Pawn Killer, name damageType, vector HitLocation){

	local class KillerClass;
	
	if(Killer != None){
	
		if(Killer.PlayerReplicationInfo == None && Killed.PlayerReplicationInfo != None){						if(Killer != None){				KillerClass = Killer.class;			}else{				KillerClass = Killed.class;			}					printLog( "nstats" $Chr(9)$ "mk" $Chr(9)$ KillerClass $ Chr(9) $ Killed.PlayerReplicationInfo.PlayerID);		}
		
	}else{
	
		
		LogSuicideLocation(Killed);
	
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
	bLogACEPlayerHWID=True
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
}
