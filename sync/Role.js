/**
 *
 * @class
 */

class Role {
    /**
     * @abstract
     * @method
     *
     * @param {number} availEnergy Energy available for spawning. Will calculate maximum affordable body for role.
     *
     * @return {Array<string>}
     */
    body(availEnergy) {
        return [];
    }

    /**
     * @abstract
     * @method
     *
     * @param {Creep} creep Creep to run.
     */
    run(creep) {}
}

module.exports = Role;
