(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/scripts/star.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '36f01Coe/VKr6+6eDKStYt5', 'star', __filename);
// scripts/star.js

"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

cc.Class(_defineProperty({
  extends: cc.Component,

  properties: {
    pickRadius: 0

  },

  // use this for initialization
  onLoad: function onLoad() {},
  getPlayerDistance: function getPlayerDistance() {
    var playerPos = this.game.player.getPosition();
    var dist = cc.pDistance(this.node.position, playerPos);
    return dist;
  },
  onPicker: function onPicker() {
    this.game.spawnNewStar();
    this.node.destroy();
  },
  update: function update(dt) {
    if (this.getPlayerDistance() < this.pickRadius) {
      this.onPicked();
      return;
    }
  },
  onPicked: function onPicked() {
    this.game.spawnNewStar();
    this.game.gainScore();
    this.node.destroy();
  }

}, "update", function update(dt) {
  var opacityRatio = 1 - this.game.timer / this.game.starDuration;
  var minOpacity = 50;
  this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
}));

cc._RF.pop();
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=star.js.map
        