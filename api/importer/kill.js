export default class Kill{

    constructor(time, type, killerId, killerWeapon, victimId, victimWeapon, deathType){

        this.type = type;
        this.timestamp = parseFloat(time);
        this.killerId = parseInt(killerId);
        this.killerWeapon = killerWeapon;
        this.victimId = parseInt(victimId);
        this.victimWeapon = victimWeapon;
        this.deathType = deathType;

        this.killDistance = -1;
        this.killerLocation = null;
        this.victimLocation = null;

    }


    setDistance(distance){

        distance = parseFloat(distance);
        this.killDistance = distance;
    }

    setLocations(killerLocation, victimLocation){

        this.killerLocation = {
            "x": parseFloat(killerLocation.x),
            "y": parseFloat(killerLocation.y),
            "z": parseFloat(killerLocation.z)
        }

        this.victimLocation = {
            "x": parseFloat(victimLocation.x),
            "y": parseFloat(victimLocation.y),
            "z": parseFloat(victimLocation.z)
        }

    }
}