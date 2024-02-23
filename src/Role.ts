/**
 *
 * @interface
 */

export interface Role {
  /**
   * @abstract
   * @method
   *
   * @param {number} availEnergy Energy available for spawning. Will calculate maximum affordable body for role.
   *
   * @return {Array<BodyPartConstant>}
   */
  body(availEnergy: number): BodyPartConstant[];

  /**
   * @abstract
   * @method
   *
   * @param {Creep} creep Creep to run.
   */
  run(creep: Creep): void;
}
