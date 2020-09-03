class PlayerInfo{

    constructor(id, name, timeStamp){

        this.id = id;
        this.name = name;
        this.connects = [timeStamp];
        this.disconnects = [];
        this.teams = [];
        this.bBot = false;

        //console.log(this);

    }

    connect(timeStamp){
        this.connects.push(timeStamp);
    }

    disconnect(timeStamp){
        this.disconnects.push(timeStamp);
    }

    setTeam(timeStamp, id){

        this.teams.push({
            "time": parseFloat(timeStamp),
            "id": parseInt(id)
        });
    }

    setAsBot(){
        this.bBot = true;
    }

    setFace(face){
        this.face = face;
    }

    setVoice(voice){
        this.voice = voice;
    }

    setNetspeed(speed){

        this.netSpeed = parseFloat(speed);
    }

}


module.exports = PlayerInfo;