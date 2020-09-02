class PlayerInfo{

    constructor(id, name, timeStamp){

        this.id = id;
        this.name = name;
        this.connects = [timeStamp];
        this.disconnects = [];

        //console.log(this);

    }

    connect(timeStamp){
        this.connects.push(timeStamp);
    }

    disconnect(timeStamp){

        console.log(`${this.name} disconnected at ${timeStamp}`);
        this.disconnects.push(timeStamp);
    }

}


module.exports = PlayerInfo;