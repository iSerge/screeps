const util = require('./utils');

const Role = require('./Role');

/**
 *
 * @class
 * @extends {Role}
 */
class Claim extends Role {
    /**
     * @override
     */
    body(availEnergy) {
        return [MOVE,MOVE,CLAIM];
    }


    /**
     * @override
     */
    run(creep) {
        util.tryBuildRoad(creep);

        if (creep.memory.claimTarget) {
            // Move to target & claim
        } else {
            // Find target for claim
        }
    }
}

module.exports = new Carrier();
