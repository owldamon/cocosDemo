require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"game":[function(require,module,exports){
"use strict";
cc._RF.push(module, '22ab7CWVTNIOJZpoBDNRgyq', 'game');
// scripts/game.js

'use strict';

cc.Class({
  extends: cc.Component,

  properties: {
    // 页面窗口

    // 这个属性引用了星星预制资源
    starPrefab: {
      default: null,
      type: cc.Prefab
    },
    // 星星产生后消失时间的随机范围
    maxStarDuration: 0,
    minStarDuration: 0,
    // 地面节点，用于确定星星生成的高度
    ground: {
      default: null,
      type: cc.Node
    },
    // player 节点，用于获取主角弹跳的高度，和控制主角行动开关
    player: {
      default: null,
      type: cc.Node
    },
    scoreDisplay: {
      default: null,
      type: cc.Label
    },
    scoreAudio: {
      default: null,
      url: cc.AudioClip
    }
  },

  // use this for initialization
  onLoad: function onLoad() {
    // 获取地平面的 y 轴坐标
    this.groundY = this.ground.y + this.ground.height / 2;

    // 生成一个新的星星
    this.timer = 0;
    this.starDuration = 0;
    this.spawnNewStar();
    this.score = 0;
    this.getCanvasSize();
  },
  spawnNewStar: function spawnNewStar() {
    // 使用给定的模板在场景中生成一个新节点
    var newStar = cc.instantiate(this.starPrefab);
    // 将新增的节点添加到 Canvas 节点下面
    this.node.addChild(newStar);
    // 为星星设置一个随机位置
    newStar.setPosition(this.getNewStarPosition());
    // 将game组件的实例传入星星组件
    newStar.getComponent('star').game = this;
    this.starDuration = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
    this.timer = 0;
  },
  getCanvasSize: function getCanvasSize() {
    // 将game组件的实例传入怪物组件
    this.player.getComponent('player').game = this;
  },
  getNewStarPosition: function getNewStarPosition() {
    var randX = 0;
    // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
    var randY = this.groundY + cc.random0To1() * this.player.getComponent('player').jumpHeight + 50;
    // 根据屏幕宽度，随机得到一个星星 x 坐标
    var maxX = this.node.width / 2 - this.player.width;

    randX = cc.randomMinus1To1() * maxX;
    // 返回星星坐标
    return cc.p(randX, randY);
  },
  gainScore: function gainScore() {
    this.score += 1;
    // 更新 scoreDisplay Label 的文字
    this.scoreDisplay.string = 'Score: ' + this.score.toString();
    // 播放得分音效
    cc.audioEngine.playEffect(this.scoreAudio, false);
  },
  gameOver: function gameOver() {
    this.player.stopAllActions();
    cc.director.loadScene('game');
  },
  // called every frame, uncomment this function to activate update callback
  update: function update(dt) {
    if (this.timer > this.starDuration) {
      this.gameOver();
      return;
    }
    this.timer += dt;
  }
});

cc._RF.pop();
},{}],"player":[function(require,module,exports){
"use strict";
cc._RF.push(module, '371e9AbjWZAeITCLl9uUgOF', 'player');
// scripts/player.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        // 主角跳跃高度
        jumpHeight: 0,
        // 主角跳跃持续时间
        jumpDuration: 0,
        // 最大移动速度
        maxMoveSpeed: 0,
        // 加速度
        accel: 0,
        // 跳跃音效
        jumpAudio: {
            default: null,
            url: cc.AudioClip
        }
    },

    setJumpActon: function setJumpActon() {
        // 跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        // 跳跃下降
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());

        var callback = cc.callFunc(this.playJumpSound, this);
        return cc.repeatForever(cc.sequence(jumpUp, jumpDown, callback));
    },
    playJumpSound: function playJumpSound() {
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },
    setInputControl: function setInputControl() {
        var self = this;
        // 添加键盘控制
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function onKeyPressed(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = true;
                        self.accRight = false;
                        break;
                    case cc.KEY.d:
                        self.accLeft = false;
                        self.accRight = true;
                        break;
                }
            },
            onKeyReleased: function onKeyReleased(keyCode, event) {
                switch (keyCode) {
                    case cc.KEY.a:
                        self.accLeft = false;
                        break;
                    case cc.KEY.d:
                        self.accRight = false;
                        break;
                }
            }
        }, self.node);
    },
    onPlayOver: function onPlayOver() {
        if (this.node.getPosition().x > this.overLine - this.node.width) {
            this.node.x = this.overLine - this.node.width;
            this.xSpeed = 0;
            return;
        }
        if (this.node.getPosition().x < -this.overLine + this.node.width) {
            this.node.x = -this.overLine + this.node.width;
            this.xSpeed = 0;
            return;
        }
    },
    // use this for initialization
    onLoad: function onLoad() {
        // 初始化跳跃动作
        this.jumpAciton = this.setJumpActon();
        this.node.runAction(this.jumpAciton);
        this.accLeft = false;
        this.accRight = false;
        this.xSpeed = 0;
        this.setInputControl();
        this.overLine = this.game.node.width / 2;
        cc.log(this.node.width);
    },

    // called every frame, uncomment this function to activate update callback
    update: function update(dt) {
        if (this.accLeft) {
            this.xSpeed -= this.accel * dt;
        } else if (this.accRight) {
            this.xSpeed += this.accel * dt;
        };
        if (Math.abs(this.xSpeed) > this.maxMoveSpeed) {
            this.xSpeed = this.maxMoveSpeed * this.xSpeed / Math.abs(this.xSpeed);
        };
        this.node.x += this.xSpeed * dt;
        this.onPlayOver();
    }
});

cc._RF.pop();
},{}],"star":[function(require,module,exports){
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
},{}]},{},["game","player","star"])

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHRzL2dhbWUuanMiLCJhc3NldHMvc2NyaXB0cy9wbGF5ZXIuanMiLCJhc3NldHMvc2NyaXB0cy9zdGFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUNFOztBQUVBO0FBQ0U7O0FBRUE7QUFDQTtBQUNFO0FBQ0E7QUFGVTtBQUlaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRTtBQUNBO0FBRk07QUFJUjtBQUNBO0FBQ0U7QUFDQTtBQUZNO0FBSVI7QUFDRTtBQUNBO0FBRlk7QUFJZDtBQUNFO0FBQ0E7QUFGVTtBQXpCRjs7QUErQlo7QUFDQTtBQUNFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7QUFDRDtBQUNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7QUFDRDtBQUNFO0FBQ0E7QUFDRDtBQUNEO0FBQ0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDRDtBQUNEO0FBQ0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNEO0FBQ0Q7QUFDRTtBQUNBO0FBQ0Q7QUFDRDtBQUNBO0FBQ0U7QUFDRTtBQUNBO0FBQ0Q7QUFDRDtBQUNEO0FBM0ZNOzs7Ozs7Ozs7O0FDQVQ7QUFDSTs7QUFFQTtBQUNJO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0k7QUFDQTtBQUZPO0FBVkg7O0FBZ0JaO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUVIO0FBQ0Q7QUFDSTtBQUNIO0FBQ0Q7QUFDSTtBQUNBO0FBQ0E7QUFDSTtBQUNBO0FBQ0k7QUFDSTtBQUNJO0FBQ0E7QUFDQTtBQUNKO0FBQ0k7QUFDQTtBQUNBO0FBUlI7QUFVSDtBQUNEO0FBQ0k7QUFDSTtBQUNJO0FBQ0E7QUFDSjtBQUNJO0FBQ0E7QUFOUjtBQVFIO0FBdkJ1QjtBQXlCL0I7QUFDRDtBQUNJO0FBQ0k7QUFDQTtBQUNBO0FBQ0g7QUFDRDtBQUNJO0FBQ0E7QUFDQTtBQUNIO0FBQ0o7QUFDRDtBQUNBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0g7O0FBRUQ7QUFDQTtBQUNJO0FBQ0k7QUFDSDtBQUNHO0FBQ0g7QUFDRDtBQUNJO0FBQ0g7QUFDRDtBQUNBO0FBQ0g7QUFsR0k7Ozs7Ozs7Ozs7QUNBVDtBQUNFOztBQUVBO0FBQ0U7O0FBRFU7O0FBS1o7QUFDQTtBQUdBO0FBQ0U7QUFDQTtBQUNBO0FBQ0Q7QUFDRDtBQUNFO0FBQ0E7QUFDRDtBQUNEO0FBQ0U7QUFDRTtBQUNBO0FBQ0Q7QUFDRDtBQUNBO0FBQ0E7QUFDRDtBQUNEO0FBQ0U7QUFDQTtBQUNBO0FBQ0Q7O0FBbENNIiwic291cmNlc0NvbnRlbnQiOlsiY2MuQ2xhc3Moe1xyXG4gIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcclxuXHJcbiAgcHJvcGVydGllczoge1xyXG4gICAgLy8g6aG16Z2i56qX5Y+jXHJcbiAgICBcclxuICAgIC8vIOi/meS4quWxnuaAp+W8leeUqOS6huaYn+aYn+mihOWItui1hOa6kFxyXG4gICAgc3RhclByZWZhYjoge1xyXG4gICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICB0eXBlOiBjYy5QcmVmYWJcclxuICAgIH0sXHJcbiAgICAvLyDmmJ/mmJ/kuqfnlJ/lkI7mtojlpLHml7bpl7TnmoTpmo/mnLrojIPlm7RcclxuICAgIG1heFN0YXJEdXJhdGlvbjogMCxcclxuICAgIG1pblN0YXJEdXJhdGlvbjogMCxcclxuICAgIC8vIOWcsOmdouiKgueCue+8jOeUqOS6juehruWumuaYn+aYn+eUn+aIkOeahOmrmOW6plxyXG4gICAgZ3JvdW5kOiB7XHJcbiAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgIHR5cGU6IGNjLk5vZGVcclxuICAgIH0sXHJcbiAgICAvLyBwbGF5ZXIg6IqC54K577yM55So5LqO6I635Y+W5Li76KeS5by56Lez55qE6auY5bqm77yM5ZKM5o6n5Yi25Li76KeS6KGM5Yqo5byA5YWzXHJcbiAgICBwbGF5ZXI6IHtcclxuICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgdHlwZTogY2MuTm9kZVxyXG4gICAgfSxcclxuICAgIHNjb3JlRGlzcGxheToge1xyXG4gICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICB0eXBlOiBjYy5MYWJlbFxyXG4gICAgfSxcclxuICAgIHNjb3JlQXVkaW86IHtcclxuICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcclxuICAgIH1cclxuICB9LFxyXG5cclxuICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cclxuICBvbkxvYWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8g6I635Y+W5Zyw5bmz6Z2i55qEIHkg6L205Z2Q5qCHXHJcbiAgICB0aGlzLmdyb3VuZFkgPSB0aGlzLmdyb3VuZC55ICsgdGhpcy5ncm91bmQuaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAvLyDnlJ/miJDkuIDkuKrmlrDnmoTmmJ/mmJ9cclxuICAgIHRoaXMudGltZXIgPSAwO1xyXG4gICAgdGhpcy5zdGFyRHVyYXRpb24gPSAwO1xyXG4gICAgdGhpcy5zcGF3bk5ld1N0YXIoKTtcclxuICAgIHRoaXMuc2NvcmUgPSAwO1xyXG4gICAgdGhpcy5nZXRDYW52YXNTaXplKCk7XHJcbiAgfSxcclxuICBzcGF3bk5ld1N0YXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8g5L2/55So57uZ5a6a55qE5qih5p2/5Zyo5Zy65pmv5Lit55Sf5oiQ5LiA5Liq5paw6IqC54K5XHJcbiAgICB2YXIgbmV3U3RhciA9IGNjLmluc3RhbnRpYXRlKHRoaXMuc3RhclByZWZhYik7XHJcbiAgICAvLyDlsIbmlrDlop7nmoToioLngrnmt7vliqDliLAgQ2FudmFzIOiKgueCueS4i+mdolxyXG4gICAgdGhpcy5ub2RlLmFkZENoaWxkKG5ld1N0YXIpO1xyXG4gICAgLy8g5Li65pif5pif6K6+572u5LiA5Liq6ZqP5py65L2N572uXHJcbiAgICBuZXdTdGFyLnNldFBvc2l0aW9uKHRoaXMuZ2V0TmV3U3RhclBvc2l0aW9uKCkpO1xyXG4gICAgLy8g5bCGZ2FtZee7hOS7tueahOWunuS+i+S8oOWFpeaYn+aYn+e7hOS7tlxyXG4gICAgbmV3U3Rhci5nZXRDb21wb25lbnQoJ3N0YXInKS5nYW1lID0gdGhpcztcclxuICAgIHRoaXMuc3RhckR1cmF0aW9uID0gdGhpcy5taW5TdGFyRHVyYXRpb24gKyBjYy5yYW5kb20wVG8xKCkgKiAodGhpcy5tYXhTdGFyRHVyYXRpb24gLSB0aGlzLm1pblN0YXJEdXJhdGlvbik7XHJcbiAgICB0aGlzLnRpbWVyID0gMDtcclxuICB9LFxyXG4gIGdldENhbnZhc1NpemU6IGZ1bmN0aW9uKCl7XHJcbiAgICAvLyDlsIZnYW1l57uE5Lu255qE5a6e5L6L5Lyg5YWl5oCq54mp57uE5Lu2XHJcbiAgICB0aGlzLnBsYXllci5nZXRDb21wb25lbnQoJ3BsYXllcicpLmdhbWUgPSB0aGlzO1xyXG4gIH0sXHJcbiAgZ2V0TmV3U3RhclBvc2l0aW9uOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciByYW5kWCA9IDA7XHJcbiAgICAvLyDmoLnmja7lnLDlubPpnaLkvY3nva7lkozkuLvop5Lot7Pot4Ppq5jluqbvvIzpmo/mnLrlvpfliLDkuIDkuKrmmJ/mmJ/nmoQgeSDlnZDmoIdcclxuICAgIHZhciByYW5kWSA9IHRoaXMuZ3JvdW5kWSArIGNjLnJhbmRvbTBUbzEoKSAqIHRoaXMucGxheWVyLmdldENvbXBvbmVudCgncGxheWVyJykuanVtcEhlaWdodCArIDUwO1xyXG4gICAgLy8g5qC55o2u5bGP5bmV5a695bqm77yM6ZqP5py65b6X5Yiw5LiA5Liq5pif5pifIHgg5Z2Q5qCHXHJcbiAgICB2YXIgbWF4WCA9IHRoaXMubm9kZS53aWR0aCAvIDIgLSB0aGlzLnBsYXllci53aWR0aDtcclxuICAgIFxyXG4gICAgcmFuZFggPSBjYy5yYW5kb21NaW51czFUbzEoKSAqIG1heFg7XHJcbiAgICAvLyDov5Tlm57mmJ/mmJ/lnZDmoIdcclxuICAgIHJldHVybiBjYy5wKHJhbmRYLCByYW5kWSk7XHJcbiAgfSxcclxuICBnYWluU2NvcmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zY29yZSArPSAxO1xyXG4gICAgLy8g5pu05pawIHNjb3JlRGlzcGxheSBMYWJlbCDnmoTmloflrZdcclxuICAgIHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyA9ICdTY29yZTogJyArIHRoaXMuc2NvcmUudG9TdHJpbmcoKTtcclxuICAgIC8vIOaSreaUvuW+l+WIhumfs+aViFxyXG4gICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnNjb3JlQXVkaW8sIGZhbHNlKTtcclxuICB9LFxyXG4gIGdhbWVPdmVyOiBmdW5jdGlvbigpIHtcclxuICAgIHRoaXMucGxheWVyLnN0b3BBbGxBY3Rpb25zKCk7XHJcbiAgICBjYy5kaXJlY3Rvci5sb2FkU2NlbmUoJ2dhbWUnKTtcclxuICB9LFxyXG4gIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXHJcbiAgdXBkYXRlOiBmdW5jdGlvbihkdCkge1xyXG4gICAgaWYgKHRoaXMudGltZXIgPiB0aGlzLnN0YXJEdXJhdGlvbikge1xyXG4gICAgICB0aGlzLmdhbWVPdmVyKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHRoaXMudGltZXIgKz0gZHQ7XHJcbiAgfSxcclxufSk7IiwiY2MuQ2xhc3Moe1xyXG4gICAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxyXG5cclxuICAgIHByb3BlcnRpZXM6IHtcclxuICAgICAgICAvLyDkuLvop5Lot7Pot4Ppq5jluqZcclxuICAgICAgICBqdW1wSGVpZ2h0OiAwLFxyXG4gICAgICAgIC8vIOS4u+inkui3s+i3g+aMgee7reaXtumXtFxyXG4gICAgICAgIGp1bXBEdXJhdGlvbjogMCxcclxuICAgICAgICAvLyDmnIDlpKfnp7vliqjpgJ/luqZcclxuICAgICAgICBtYXhNb3ZlU3BlZWQ6IDAsXHJcbiAgICAgICAgLy8g5Yqg6YCf5bqmXHJcbiAgICAgICAgYWNjZWw6IDAsXHJcbiAgICAgICAgLy8g6Lez6LeD6Z+z5pWIXHJcbiAgICAgICAganVtcEF1ZGlvOiB7XHJcbiAgICAgICAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgICAgICAgIHVybDogY2MuQXVkaW9DbGlwXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuXHJcbiAgICBzZXRKdW1wQWN0b246IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDot7Pot4PkuIrljYdcclxuICAgICAgICB2YXIganVtcFVwID0gY2MubW92ZUJ5KHRoaXMuanVtcER1cmF0aW9uLCBjYy5wKDAsIHRoaXMuanVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25PdXQoKSk7XHJcbiAgICAgICAgLy8g6Lez6LeD5LiL6ZmNXHJcbiAgICAgICAgdmFyIGp1bXBEb3duID0gY2MubW92ZUJ5KHRoaXMuanVtcER1cmF0aW9uLCBjYy5wKDAsIC10aGlzLmp1bXBIZWlnaHQpKS5lYXNpbmcoY2MuZWFzZUN1YmljQWN0aW9uSW4oKSk7XHJcblxyXG4gICAgICAgIHZhciBjYWxsYmFjayA9IGNjLmNhbGxGdW5jKHRoaXMucGxheUp1bXBTb3VuZCwgdGhpcyk7XHJcbiAgICAgICAgcmV0dXJuIGNjLnJlcGVhdEZvcmV2ZXIoY2Muc2VxdWVuY2UoanVtcFVwLCBqdW1wRG93biwgY2FsbGJhY2spKTtcclxuXHJcbiAgICB9LFxyXG4gICAgcGxheUp1bXBTb3VuZDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGNjLmF1ZGlvRW5naW5lLnBsYXlFZmZlY3QodGhpcy5qdW1wQXVkaW8sIGZhbHNlKTtcclxuICAgIH0sXHJcbiAgICBzZXRJbnB1dENvbnRyb2w6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgLy8g5re75Yqg6ZSu55uY5o6n5Yi2XHJcbiAgICAgICAgY2MuZXZlbnRNYW5hZ2VyLmFkZExpc3RlbmVyKHtcclxuICAgICAgICAgICAgZXZlbnQ6IGNjLkV2ZW50TGlzdGVuZXIuS0VZQk9BUkQsXHJcbiAgICAgICAgICAgIG9uS2V5UHJlc3NlZDogZnVuY3Rpb24gKGtleUNvZGUsIGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5hOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY1JpZ2h0ID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIG9uS2V5UmVsZWFzZWQ6IGZ1bmN0aW9uIChrZXlDb2RlLCBldmVudCkge1xyXG4gICAgICAgICAgICAgICAgc3dpdGNoIChrZXlDb2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuYTpcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmQ6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LCBzZWxmLm5vZGUpO1xyXG4gICAgfSxcclxuICAgIG9uUGxheU92ZXI6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICBpZiAodGhpcy5ub2RlLmdldFBvc2l0aW9uKCkueCA+IHRoaXMub3ZlckxpbmUgLSB0aGlzLm5vZGUud2lkdGgpIHtcclxuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSB0aGlzLm92ZXJMaW5lIC0gdGhpcy5ub2RlLndpZHRoO1xyXG4gICAgICAgICAgICB0aGlzLnhTcGVlZCA9IDBcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5ub2RlLmdldFBvc2l0aW9uKCkueCA8IC10aGlzLm92ZXJMaW5lICsgdGhpcy5ub2RlLndpZHRoKSB7XHJcbiAgICAgICAgICAgIHRoaXMubm9kZS54ID0gLXRoaXMub3ZlckxpbmUgKyB0aGlzLm5vZGUud2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMueFNwZWVkID0gMFxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxyXG4gICAgb25Mb2FkOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgLy8g5Yid5aeL5YyW6Lez6LeD5Yqo5L2cXHJcbiAgICAgICAgdGhpcy5qdW1wQWNpdG9uID0gdGhpcy5zZXRKdW1wQWN0b24oKTtcclxuICAgICAgICB0aGlzLm5vZGUucnVuQWN0aW9uKHRoaXMuanVtcEFjaXRvbik7XHJcbiAgICAgICAgdGhpcy5hY2NMZWZ0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy5hY2NSaWdodCA9IGZhbHNlO1xyXG4gICAgICAgIHRoaXMueFNwZWVkID0gMDtcclxuICAgICAgICB0aGlzLnNldElucHV0Q29udHJvbCgpO1xyXG4gICAgICAgIHRoaXMub3ZlckxpbmUgPSB0aGlzLmdhbWUubm9kZS53aWR0aCAvIDI7XHJcbiAgICAgICAgY2MubG9nKHRoaXMubm9kZS53aWR0aCk7XHJcbiAgICB9LFxyXG5cclxuICAgIC8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXHJcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xyXG4gICAgICAgIGlmICh0aGlzLmFjY0xlZnQpIHtcclxuICAgICAgICAgICAgdGhpcy54U3BlZWQgLT0gdGhpcy5hY2NlbCAqIGR0O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5hY2NSaWdodCkge1xyXG4gICAgICAgICAgICB0aGlzLnhTcGVlZCArPSB0aGlzLmFjY2VsICogZHQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoTWF0aC5hYnModGhpcy54U3BlZWQpID4gdGhpcy5tYXhNb3ZlU3BlZWQpIHtcclxuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSB0aGlzLm1heE1vdmVTcGVlZCAqIHRoaXMueFNwZWVkIC8gTWF0aC5hYnModGhpcy54U3BlZWQpO1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdGhpcy5ub2RlLnggKz0gdGhpcy54U3BlZWQgKiBkdDtcclxuICAgICAgICB0aGlzLm9uUGxheU92ZXIoKTtcclxuICAgIH0sXHJcbn0pOyIsImNjLkNsYXNzKHtcclxuICBleHRlbmRzOiBjYy5Db21wb25lbnQsXHJcblxyXG4gIHByb3BlcnRpZXM6IHtcclxuICAgIHBpY2tSYWRpdXM6IDAsXHJcblxyXG4gIH0sXHJcblxyXG4gIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxyXG4gIG9uTG9hZDogZnVuY3Rpb24oKSB7XHJcblxyXG4gIH0sXHJcbiAgZ2V0UGxheWVyRGlzdGFuY2U6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHBsYXllclBvcyA9IHRoaXMuZ2FtZS5wbGF5ZXIuZ2V0UG9zaXRpb24oKTtcclxuICAgIHZhciBkaXN0ID0gY2MucERpc3RhbmNlKHRoaXMubm9kZS5wb3NpdGlvbiwgcGxheWVyUG9zKTtcclxuICAgIHJldHVybiBkaXN0O1xyXG4gIH0sXHJcbiAgb25QaWNrZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5nYW1lLnNwYXduTmV3U3RhcigpO1xyXG4gICAgdGhpcy5ub2RlLmRlc3Ryb3koKTtcclxuICB9LFxyXG4gIHVwZGF0ZTogZnVuY3Rpb24oZHQpIHtcclxuICAgIGlmICh0aGlzLmdldFBsYXllckRpc3RhbmNlKCkgPCB0aGlzLnBpY2tSYWRpdXMpIHtcclxuICAgICAgdGhpcy5vblBpY2tlZCgpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICB2YXIgb3BhY2l0eVJhdGlvID0gMSAtIHRoaXMuZ2FtZS50aW1lciAvIHRoaXMuZ2FtZS5zdGFyRHVyYXRpb247XHJcbiAgICB2YXIgbWluT3BhY2l0eSA9IDUwO1xyXG4gICAgdGhpcy5ub2RlLm9wYWNpdHkgPSBtaW5PcGFjaXR5ICsgTWF0aC5mbG9vcihvcGFjaXR5UmF0aW8gKiAoMjU1IC0gbWluT3BhY2l0eSkpO1xyXG4gIH0sXHJcbiAgb25QaWNrZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5nYW1lLnNwYXduTmV3U3RhcigpO1xyXG4gICAgdGhpcy5nYW1lLmdhaW5TY29yZSgpO1xyXG4gICAgdGhpcy5ub2RlLmRlc3Ryb3koKTtcclxuICB9LFxyXG5cclxuXHJcbn0pOyJdLCJzb3VyY2VSb290IjoiIn0=