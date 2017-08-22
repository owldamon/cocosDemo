"use strict";
cc._RF.push(module, '36f01Coe/VKr6+6eDKStYt5', 'star');
// scripts/star.js

"use strict";

cc.Class({
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
    var opacityRatio = 1 - this.game.timer / this.game.starDuration;
    var minOpacity = 50;
    this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
  },
  onPicked: function onPicked() {
    this.game.spawnNewStar();
    this.game.gainScore();
    this.node.destroy();
  }

});

cc._RF.pop();