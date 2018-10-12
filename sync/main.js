module.exports=function(o){var t={}
function n(e){if(t[e])return t[e].exports
var r=t[e]={i:e,l:!1,exports:{}}
return o[e].call(r.exports,r,r.exports,n),r.l=!0,r.exports}return n.m=o,n.c=t,n.d=function(e,r,o){n.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:o})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(r,e){if(1&e&&(r=n(r)),8&e)return r
if(4&e&&"object"==typeof r&&r&&r.__esModule)return r
var o=Object.create(null)
if(n.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var t in r)n.d(o,t,function(e){return r[e]}.bind(null,t))
return o},n.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e}
return n.d(r,"a",r),r},n.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},n.p="",n(n.s=0)}({"./src/limits.ts":function(e,r,o){"use strict"
Object.defineProperty(r,"__esModule",{value:!0}),r.limits={builder:2,carrier:3,claimer:2,harvester:2,upgrader:2}},"./src/main.ts":function(e,r,o){"use strict"
Object.defineProperty(r,"__esModule",{value:!0})
var t=o("lodash"),n=o("./src/roles.ts"),i=o("./src/utils.ts"),u=new(function(){function e(){}return e.prototype.findDamagedStructures=function(){t.forOwn(Game.rooms,function(r){r.find(FIND_STRUCTURES,{filter:function(e){return(e.structureType===STRUCTURE_WALL&&e.hits<Memory.maxWallHits||e.structureType===STRUCTURE_RAMPART&&e.hits<Memory.maxRampartHits/2||e.structureType===STRUCTURE_CONTAINER&&e.hits<e.hitsMax-5e4||e.structureType!==STRUCTURE_RAMPART&&e.structureType!==STRUCTURE_WALL&&e.hits<e.hitsMax/2)&&i.utils.enqueueStructure(r,e),!1}})})},e.prototype.towerLogic=function(){t.forOwn(Game.structures,function(e){if(e.structureType===STRUCTURE_TOWER){var r=e,o=r.pos.findClosestByRange(FIND_HOSTILE_CREEPS,{filter:function(e){return e.pos.inRangeTo(r.pos,r.room.memory.towerActive?15:7)}})
o?(r.room.memory.towerActive=!0,r.attack(o)):r.room.memory.towerActive=!1
var t=r.pos.findClosestByRange(FIND_MY_CREEPS,{filter:function(e){return e.hits<e.hitsMax/3}})
if(t&&r.heal(t),700<r.energy){var n=r.pos.findClosestByRange(FIND_STRUCTURES,{filter:function(e){return e.structureType===STRUCTURE_RAMPART&&e.hits<Memory.maxRampartHits||e.structureType!==STRUCTURE_WALL&&e.structureType!==STRUCTURE_RAMPART&&e.hits<e.hitsMax/3}})
n&&r.repair(n)}var i=r.pos.findClosestByRange(FIND_MY_CREEPS,{filter:function(e){return e.hits<e.hitsMax}})
i&&r.heal(i)}})},e.prototype.creepActions=function(){t.forOwn(Game.creeps,function(e){n.rolesModule.run(e)})},e}())
e.exports.loop=function(){i.utils.updateInfrastructure(),i.utils.clearMemory(),u.findDamagedStructures(),n.rolesModule.countCreeps(),t.forOwn(Game.rooms,function(e){e.controller&&(0===Object.getOwnPropertyNames(Game.creeps).length&&(e.memory.spawnQueue=[],e.memory.spawnQueue.unshift({body:[CARRY,MOVE],role:n.CARRIER}),e.memory.spawnQueue.unshift({body:[CARRY,WORK,WORK,MOVE],role:n.HARVESTER})),n.rolesModule.spawn(e))}),t.forOwn(Game.spawns,function(e){if(n.rolesModule.processSpawnQueue(e),e.spawning){var r=Game.creeps[e.spawning.name]
e.room.visual.text(i.Messages.CONSTRUCT_SYM+" "+r.memory.role,e.pos.x+1,e.pos.y,{align:"left",opacity:.8})}}),u.towerLogic(),u.creepActions()}},"./src/role.builder.ts":function(e,r,o){"use strict"
Object.defineProperty(r,"__esModule",{value:!0})
var n=o("lodash"),t=o("./src/utils.ts"),i=function(){function e(){}return e.prototype.body=function(e){return e<350?[WORK,CARRY,CARRY,MOVE]:e<450?[WORK,CARRY,CARRY,MOVE,MOVE]:e<550?[WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE]:e<600?[WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE]:e<650?[WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE]:e<750?[WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE]:[WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,MOVE,MOVE,MOVE,MOVE]},e.prototype.run=function(e){var r
if(t.utils.tryBuildRoad(e),e.memory.building||e.memory.energyTarget||!t.utils.navigateToDesignatedRoom(e)||!e.memory.operateInRoom){if(e.memory.building&&0===e.carry.energy&&(e.memory.building=!1,e.memory.energyTarget="",e.say(t.Messages.HARVEST)),e.memory.building||e.carry.energy!==e.carryCapacity||(e.memory.building=!0,e.say(t.Messages.BUILD)),e.memory.building)(r=Game.getObjectById(e.memory.buildTarget))||((r=t.utils.shiftStructure(e,!0))||(r=t.utils.findConstructionSite(e)),r||(r=t.utils.shiftStructure(e,!1)),r?e.memory.buildTarget=r.id:(e.say("\ud83d\udea7 nothing"),e.memory.buildTarget="",e.memory.energyTarget="",e.memory.building=!1)),r instanceof Structure?r.structureType!==STRUCTURE_WALL&&r.structureType!==STRUCTURE_RAMPART&&r.hits<r.hitsMax||r.structureType===STRUCTURE_WALL&&r.hits<Memory.maxWallHits||r.structureType===STRUCTURE_RAMPART&&r.hits<Memory.maxRampartHits?e.repair(r)===ERR_NOT_IN_RANGE&&t.utils.moveTo(e,r.pos):(e.memory.buildTarget="",e.memory.building=!1):r instanceof ConstructionSite?e.build(r)===ERR_NOT_IN_RANGE&&t.utils.moveTo(e,r.pos):(e.memory.buildTarget="",e.memory.building=!1)
else if(e.carry.energy<e.carryCapacity)if(r=t.utils.getEnergyStorageTarget(e)){var o=e.pos.findInRange([r],1)
o.length?t.utils.getEnergy(e,o[0]):t.utils.moveTo(e,r.pos)}else e.say("No energy")}else t.utils.moveTo(e,new RoomPosition(25,25,e.memory.operateInRoom))},e.prototype.findConstructionSite=function(r,o){var e=null,t=n.filter(Game.constructionSites,function(e){return e.structureType===r&&e.pos.roomName===o.memory.operateInRoom})
return t.length&&((e=o.pos.findClosestByPath(t))||(e=t[0])),e},e}()
r.roleBuilder=new i},"./src/role.carrier.ts":function(e,r,o){"use strict"
Object.defineProperty(r,"__esModule",{value:!0})
var i=o("lodash"),t=o("./src/utils.ts"),n=function(){function e(){}return e.prototype.body=function(e){var r
r=e<300?6:750<e?15:Math.floor(e/50)
for(var o=new Array(r),t=Math.ceil(r/3),n=0;n<r;++n)o[n]=n<t?MOVE:CARRY
return o},e.prototype.run=function(e){var r;(t.utils.tryBuildRoad(e),e.memory.hauling||e.memory.energyTarget||!t.utils.navigateToDesignatedRoom(e)||!e.memory.operateInRoom)?(e.memory.hauling&&0===e.carry.energy&&(e.memory.hauling=!1,e.memory.energyTarget="",e.say(t.Messages.PICKUP)),e.memory.hauling||e.carry.energy!==e.carryCapacity||(e.memory.hauling=!0,e.memory.energyTarget="",e.say(t.Messages.DISTRIBUTE)),e.memory.hauling?(r=this.getStoreTarget(e))&&e.transfer(r,RESOURCE_ENERGY)===ERR_NOT_IN_RANGE?t.utils.moveTo(e,r.pos):e.memory.energyTarget="":(r=this.getEnergyTarget(e))&&t.utils.getEnergy(e,r)===ERR_NOT_IN_RANGE?t.utils.moveTo(e,r.pos):e.memory.energyTarget=""):t.utils.moveTo(e,new RoomPosition(25,25,e.memory.operateInRoom))},e.prototype.getEnergyTarget=function(o){var e=Game.getObjectById(o.memory.energyTarget)
if(e instanceof Source&&o.pos.inRangeTo(e.pos,2)&&(e=null),!e){var r=o.room.find(FIND_DROPPED_RESOURCES,{filter:function(e){return e.resourceType===RESOURCE_ENERGY&&50<e.amount}})
e=i.sortBy(r,function(e){return-e.amount})[0]}if(!e){var t=o.room.find(FIND_STRUCTURES,{filter:function(e){if(e.structureType!==STRUCTURE_CONTAINER)return!1
var r=e
return r.id!==o.room.memory.controllerCont&&20<r.store.energy}})
e=i.sortBy(t,function(e){if(e.structureType!==STRUCTURE_CONTAINER)return 0
var r=e
return r.storeCapacity-r.store.energy})[0]}e||(e=o.room.find(FIND_MY_STRUCTURES,{filter:function(e){if(e.structureType!==STRUCTURE_STORAGE)return!1
var r=e
return r.structureType===STRUCTURE_STORAGE&&0<r.store.energy}})[0])
e||((e=o.pos.findClosestByPath(FIND_SOURCES_ACTIVE,{maxOps:100}))||(e=o.room.find(FIND_SOURCES)[0]))
return e&&(o.memory.energyTarget=e.id),e},e.prototype.getStoreTarget=function(t){var e=Game.getObjectById(t.memory.energyTarget)
if(e||t.room.energyAvailable<t.room.energyCapacityAvailable&&(e=t.pos.findClosestByPath(FIND_STRUCTURES,{filter:function(e){switch(e.structureType){case STRUCTURE_SPAWN:var r=e
return r.energy<r.energyCapacity&&t.memory.operateInRoom===r.pos.roomName
case STRUCTURE_EXTENSION:var o=e
return o.energy<o.energyCapacity&&t.memory.operateInRoom===o.pos.roomName
default:return!1}}})),!e){var r=Game.rooms[t.memory.operateInRoom],o=i.isNull(r)?null:Game.getObjectById(r.memory.controllerCont)
o&&500<o.storeCapacity-o.store.energy&&(e=o)}if(!e){var n=i.filter(Game.structures,function(e){if(STRUCTURE_TOWER!==e.structureType)return!1
var r=e
return r.room.name===t.memory.operateInRoom&&0<=r.energyCapacity-r.energy-300})
e=i.sortBy(n,function(e){if(e.structureType!==STRUCTURE_CONTAINER)return 0
var r=e
return r.energyCapacity+r.energy})[0]}e||(e=t.room.find(FIND_STRUCTURES,{filter:function(e){if(e.structureType!==STRUCTURE_STORAGE)return!1
var r=e
return 0<r.storeCapacity-r.store.energy}})[0])
e||(e=t.room.find(FIND_STRUCTURES,{filter:function(e){switch(e.structureType){case STRUCTURE_EXTENSION:var r=e
return r.energy<r.energyCapacity&&t.memory.operateInRoom===r.pos.roomName
case STRUCTURE_SPAWN:var o=e
return o.energy<o.energyCapacity&&t.memory.operateInRoom===o.pos.roomName
default:return!1}}})[0])
return e&&(t.memory.energyTarget=e.id),e},e}()
r.roleCarrier=new n},"./src/role.claimer.ts":function(e,r,o){"use strict"
Object.defineProperty(r,"__esModule",{value:!0})
var i=o("lodash"),u=o("./src/utils.ts"),t=function(){function e(){}return e.prototype.body=function(e){return e<1400?[MOVE,MOVE,CLAIM]:e<2100?[MOVE,MOVE,MOVE,MOVE,CLAIM,CLAIM]:e<2800?[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CLAIM,CLAIM,CLAIM]:[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,CLAIM,CLAIM,CLAIM,CLAIM]},e.prototype.run=function(r){u.utils.tryBuildRoad(r)
var e=Game.flags.claim
e||(e=Game.flags.reserve)
var o=e&&r.room.name===e.pos.roomName
if(e||delete r.memory.claimTarget,e&&!o&&u.utils.moveTo(r,e.pos),e&&o){var t=r.room.lookForAt(LOOK_STRUCTURES,e.pos)
t.length&&i.forEach(t,function(e){e.structureType===STRUCTURE_CONTROLLER&&(r.memory.claimTarget=e.id)})}if(r.memory.claimTarget){var n=Game.getObjectById(r.memory.claimTarget)
n&&("claim"===e.name?r.room.controller&&!r.room.controller.my?r.attackController(r.room.controller)===ERR_NOT_IN_RANGE&&r.moveTo(r.room.controller):r.claimController(n)!==OK&&u.utils.moveTo(r,n.pos):r.reserveController(n)!==OK&&u.utils.moveTo(r,n.pos))}},e}()
r.roleClaimer=new t},"./src/role.harvester.ts":function(e,r,o){"use strict"
Object.defineProperty(r,"__esModule",{value:!0})
var t=o("./src/utils.ts"),n=function(){function e(){}return e.prototype.body=function(e){return e<350?[WORK,WORK,CARRY,MOVE]:e<400?[WORK,WORK,CARRY,MOVE,MOVE]:e<500?[WORK,WORK,CARRY,MOVE,MOVE,MOVE]:e<600?[WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE]:e<700?[WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE]:[WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE]},e.prototype.run=function(e){t.utils.tryBuildRoad(e)
var r=Game.getObjectById(e.memory.target)
if(r||(r=this.findSource(e))&&(r.room.name!==e.room.name&&console.log("Harvester found target in other room: "+r.room),Memory.harvestedSources[r.id]=r.id,e.memory.target=r.id,e.say(t.Messages.HARVEST)),0<e.carry.energy){var o=e.pos.findInRange(FIND_STRUCTURES,1,{filter:function(e){return e.structureType===STRUCTURE_LINK&&e.energy<e.energyCapacity||e.structureType===STRUCTURE_CONTAINER&&e.store.energy<e.storeCapacity}})
o.length?e.transfer(o[0],RESOURCE_ENERGY):e.drop(RESOURCE_ENERGY)}r&&(e.harvest(r)===ERR_NOT_IN_RANGE&&t.utils.moveTo(e,r.pos))},e.prototype.findSource=function(e){return e.room.find(FIND_SOURCES,{filter:function(e){return!Memory.harvestedSources.hasOwnProperty(e.id)}})[0]},e}()
r.roleHarvester=new n},"./src/role.upgrader.ts":function(e,r,o){"use strict"
Object.defineProperty(r,"__esModule",{value:!0})
var t=o("./src/utils.ts"),n=function(){function e(){}return e.prototype.body=function(e){return e<350?[WORK,CARRY,MOVE,MOVE]:e<400?[WORK,WORK,CARRY,MOVE,MOVE]:e<500?[WORK,WORK,CARRY,MOVE,MOVE,MOVE]:e<600?[WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE]:e<700?[WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE]:[WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE]},e.prototype.run=function(e){if(t.utils.tryBuildRoad(e),t.utils.navigateToDesignatedRoom(e)&&e.memory.operateInRoom)t.utils.moveTo(e,new RoomPosition(25,25,e.memory.operateInRoom))
else if(e.memory.upgrading&&0===e.carry.energy&&(e.memory.upgrading=!1,e.say(t.Messages.HARVEST)),e.memory.upgrading||e.carry.energy!==e.carryCapacity||(e.memory.upgrading=!0,e.memory.energyTarget="",e.say(t.Messages.UPGRADE)),e.memory.upgrading&&e.room.controller)e.upgradeController(e.room.controller)===ERR_NOT_IN_RANGE&&t.utils.moveTo(e,e.room.controller.pos)
else{var r=t.utils.getEnergyStorageTarget(e)
if(r){var o=e.pos.findInRange([r],1)
o.length?t.utils.getEnergy(e,o[0]):t.utils.moveTo(e,r.pos)}}},e}()
r.roleUpgrader=new n},"./src/roles.ts":function(e,t,r){"use strict"
Object.defineProperty(t,"__esModule",{value:!0})
var u=r("lodash"),o=r("./src/limits.ts"),n=r("./src/role.builder.ts"),i=r("./src/role.carrier.ts"),s=r("./src/role.claimer.ts"),a=r("./src/role.harvester.ts"),m=r("./src/role.upgrader.ts")
t.BUILDER="builder",t.CARRIER="carrier",t.CLAIMER="claimer",t.HARVESTER="harvester",t.UPGRADER="upgrader",t.roles={builder:n.roleBuilder,carrier:i.roleCarrier,claimer:s.roleClaimer,harvester:a.roleHarvester,upgrader:m.roleUpgrader}
var R=function(){function e(){}return e.prototype.countCreeps=function(){u.forOwn(t.roles,function(e,r){u.forOwn(Memory.rooms,function(e){e.creepCount[r]=0})}),u.forOwn(Game.creeps,function(e){e.memory.operateInRoom?Memory.rooms[e.memory.operateInRoom].creepCount[e.memory.role]+=1:Memory.rooms[e.room.name].creepCount[e.memory.role]+=1}),u.forOwn(Memory.rooms,function(r){u.forEach(r.spawnQueue,function(e){r.creepCount[e.role]+=1})})},e.prototype.processSpawnQueue=function(e){if(!e.spawning){var r=e.room,o=r.memory.spawnQueue.shift()
if(o)if(console.log("Processing spawn Q "+e.name+" "+JSON.stringify({room:r.name,role:o.role})),e.canCreateCreep(o.body)===OK){var t=e.createCreep(o.body,void 0,{operateInRoom:r.name,role:o.role})
console.log("Spawning new "+o.role+": "+t)}else"claimer"===o.role?r.memory.spawnQueue.push(o):r.memory.spawnQueue.unshift(o)}},e.prototype.run=function(e){t.roles[e.memory.role].run(e)},e.prototype.spawn=function(n,e){var i=this
if(e)if("string"==typeof e){var r=n.energyAvailable,o=t.roles[e].body(r)
n.memory.spawnQueue.push({body:o,role:e})}else n.memory.spawnQueue.push(e)
else u.forOwn(t.roles,function(e,r){if(r&&n.memory.creepCount[r]<i.limit(r)){var o=n.energyAvailable,t=e.body(o)
n.memory.spawnQueue.push({body:t,role:r})}})},e.prototype.limit=function(e){return"claimer"===e&&u.isUndefined(Game.flags.claim)&&u.isUndefined(Game.flags.reserve)?0:o.limits[e]},e}()
t.RolesModule=R,t.rolesModule=new R},"./src/utils.ts":function(e,r,o){"use strict"
Object.defineProperty(r,"__esModule",{value:!0})
var i=o("lodash")
r.Messages={BUILD:"\ud83d\udea7 build",CONSTRUCT_SYM:"\ud83d\udee0",DISTRIBUTE:"\u2194 distr",HARVEST:"\ud83d\udd04 harvest",PICKUP:"\u2b06 pickup",UPGRADE:"\u26a1 upgrade"}
var t=function(){function o(){}return o.buildPriority=function(e,r){var o
switch(r.structureType){case STRUCTURE_SPAWN:o=1
break
case STRUCTURE_EXTENSION:o=2
break
case STRUCTURE_CONTAINER:o=3
break
case STRUCTURE_LINK:o=4
break
case STRUCTURE_TOWER:o=5
break
case STRUCTURE_STORAGE:o=6
break
default:o=7}return e.memory.operateInRoom===r.pos.roomName?o:o+20},o.prototype.clearMemory=function(){i.forOwn(Memory.creeps,function(e,r){Game.creeps.hasOwnProperty(r)||(e.target&&delete Memory.harvestedSources[e.target],delete Memory.creeps[r])}),i.forOwn(Memory.rooms,function(e,r){Game.rooms.hasOwnProperty(r)||delete Memory.rooms[r]})},o.prototype.enqueueStructure=function(e,r){i.isUndefined(r)||i.includes(e.memory.repairQueue,r.id)||e.memory.repairQueue.push(r.id)},o.prototype.findConstructionSite=function(r){return i.sortBy(Game.constructionSites,[function(e){return o.buildPriority(r,e)}])[0]},o.prototype.getEnergy=function(e,r){var o
return r instanceof Resource?(o=e.pickup(r))===OK&&(e.memory.energyTarget=""):r instanceof Source?o=e.harvest(r):(o=e.withdraw(r,RESOURCE_ENERGY))===OK&&(e.memory.energyTarget=""),o},o.prototype.getEnergyStorageTarget=function(e){var r=Game.getObjectById(e.memory.energyTarget)
if(!r){var o=e.room.find(FIND_DROPPED_RESOURCES,{filter:function(e){return e.resourceType===RESOURCE_ENERGY}})
o=o.concat(e.room.find(FIND_MY_STRUCTURES,{filter:function(e){switch(e.structureType){case STRUCTURE_STORAGE:return 0<e.store[RESOURCE_ENERGY]
case STRUCTURE_CONTAINER:return 0<e.store[RESOURCE_ENERGY]
case STRUCTURE_LINK:return 0<e.energy
default:return!1}}})),r=e.pos.findClosestByPath(o,{maxOps:1e3})}return r||(r=e.pos.findClosestByPath(FIND_SOURCES)),r&&(e.memory.energyTarget=r.id),r},o.prototype.moveTo=function(e,r){ERR_NOT_FOUND===e.moveTo(r,{noPathFinding:!0,visualizePathStyle:{stroke:"#ffffff"}})&&e.moveTo(r,{reusePath:20,visualizePathStyle:{stroke:"#ffffff"}})},o.prototype.navigateToDesignatedRoom=function(e){return e.memory.operateInRoom!==e.pos.roomName},o.prototype.shiftStructure=function(o,t){var e=o.memory.operateInRoom
if(0<Memory.rooms[e].repairQueue.length)for(var r=Game.getObjectById(Memory.rooms[e].repairQueue[0]);!r;)Memory.rooms[e].repairQueue.shift(),r=Game.getObjectById(Memory.rooms[e].repairQueue[0])
var n=i.find(Memory.rooms[e].repairQueue,function(e){var r=i.isUndefined(e)?null:Game.getObjectById(e)
return!(i.isNull(r)||t&&r.pos.roomName!==o.memory.operateInRoom)})
return i.isUndefined(n)?null:(Memory.rooms[e].repairQueue=i.filter(Memory.rooms[e].repairQueue,function(e){return e!==n}),Game.getObjectById(n))},o.prototype.tryBuildRoad=function(e){Memory.autoBuildRoads&&(i.filter(e.room.lookAt(e.pos),function(e){return e&&e.structure&&(e.type===LOOK_STRUCTURES&&e.structure.structureType===STRUCTURE_ROAD||e.type===LOOK_CONSTRUCTION_SITES)}).length||e.room.createConstructionSite(e.pos,STRUCTURE_ROAD))},o.prototype.updateInfrastructure=function(){i.forOwn(Game.rooms,function(e){i.isUndefined(e.memory.repairQueue)&&(e.memory.repairQueue=[]),i.isUndefined(e.memory.spawnQueue)&&(e.memory.spawnQueue=[]),i.isUndefined(e.memory.creepCount)&&(e.memory.creepCount={})}),i.isUndefined(Memory.harvestedSources)&&(Memory.harvestedSources={}),i.isUndefined(Memory.autoBuildRoads)&&(Memory.autoBuildRoads=!0),i.isUndefined(Memory.maxWallHits)&&(Memory.maxWallHits=1e5),i.isUndefined(Memory.maxRampartHits)&&(Memory.maxRampartHits=3e4)},o}()
r.Utils=t,r.utils=new t},0:function(e,r,o){e.exports=o("./src/main.ts")},lodash:function(e,r){e.exports=require("lodash")}})

//# sourceMappingURL=main.js.map.js