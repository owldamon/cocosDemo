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
    cc.audioEngine.playEffect(this.scoreAuio, false);
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFzc2V0cy9zY3JpcHRzL2dhbWUuanMiLCJhc3NldHMvc2NyaXB0cy9wbGF5ZXIuanMiLCJhc3NldHMvc2NyaXB0cy9zdGFyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7QUFBQTtBQUNFOztBQUVBO0FBQ0U7O0FBRUE7QUFDQTtBQUNFO0FBQ0E7QUFGVTtBQUlaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRTtBQUNBO0FBRk07QUFJUjtBQUNBO0FBQ0U7QUFDQTtBQUZNO0FBSVI7QUFDRTtBQUNBO0FBRlk7QUFJZDtBQUNFO0FBQ0E7QUFGVTtBQXpCRjs7QUErQlo7QUFDQTtBQUNFO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7QUFDRDtBQUNFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7QUFDRDtBQUNFO0FBQ0E7QUFDRDtBQUNEO0FBQ0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNEO0FBQ0Q7QUFDRTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7QUFDRDtBQUNFO0FBQ0E7QUFDRDtBQUNEO0FBQ0E7QUFDRTtBQUNFO0FBQ0E7QUFDRDtBQUNEO0FBQ0Q7QUExRk07Ozs7Ozs7Ozs7QUNBVDtBQUNJOztBQUVBO0FBQ0k7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSTtBQUNBO0FBRk87QUFWSDs7QUFnQlo7QUFDSTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBRUg7QUFDRDtBQUNJO0FBQ0g7QUFDRDtBQUNJO0FBQ0E7QUFDQTtBQUNJO0FBQ0E7QUFDSTtBQUNJO0FBQ0k7QUFDQTtBQUNBO0FBQ0o7QUFDSTtBQUNBO0FBQ0E7QUFSUjtBQVVIO0FBQ0Q7QUFDSTtBQUNJO0FBQ0k7QUFDQTtBQUNKO0FBQ0k7QUFDQTtBQU5SO0FBUUg7QUF2QnVCO0FBeUIvQjtBQUNEO0FBQ0k7QUFDSTtBQUNBO0FBQ0E7QUFDSDtBQUNEO0FBQ0k7QUFDQTtBQUNBO0FBQ0g7QUFDSjtBQUNEO0FBQ0E7QUFDSTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDSDs7QUFFRDtBQUNBO0FBQ0k7QUFDSTtBQUNIO0FBQ0c7QUFDSDtBQUNEO0FBQ0k7QUFDSDtBQUNEO0FBQ0E7QUFDSDtBQWxHSTs7Ozs7Ozs7OztBQ0FUO0FBQ0U7O0FBRUE7QUFDRTs7QUFEVTs7QUFLWjtBQUNBO0FBR0E7QUFDRTtBQUNBO0FBQ0E7QUFDRDtBQUNEO0FBQ0U7QUFDQTtBQUNEO0FBQ0Q7QUFDRTtBQUNFO0FBQ0E7QUFDRDtBQUNEO0FBQ0E7QUFDQTtBQUNEO0FBQ0Q7QUFDRTtBQUNBO0FBQ0E7QUFDRDs7QUFsQ00iLCJzb3VyY2VzQ29udGVudCI6WyJjYy5DbGFzcyh7XHJcbiAgZXh0ZW5kczogY2MuQ29tcG9uZW50LFxyXG5cclxuICBwcm9wZXJ0aWVzOiB7XHJcbiAgICAvLyDpobXpnaLnqpflj6NcclxuICAgIFxyXG4gICAgLy8g6L+Z5Liq5bGe5oCn5byV55So5LqG5pif5pif6aKE5Yi26LWE5rqQXHJcbiAgICBzdGFyUHJlZmFiOiB7XHJcbiAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgIHR5cGU6IGNjLlByZWZhYlxyXG4gICAgfSxcclxuICAgIC8vIOaYn+aYn+S6p+eUn+WQjua2iOWkseaXtumXtOeahOmaj+acuuiMg+WbtFxyXG4gICAgbWF4U3RhckR1cmF0aW9uOiAwLFxyXG4gICAgbWluU3RhckR1cmF0aW9uOiAwLFxyXG4gICAgLy8g5Zyw6Z2i6IqC54K577yM55So5LqO56Gu5a6a5pif5pif55Sf5oiQ55qE6auY5bqmXHJcbiAgICBncm91bmQ6IHtcclxuICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgdHlwZTogY2MuTm9kZVxyXG4gICAgfSxcclxuICAgIC8vIHBsYXllciDoioLngrnvvIznlKjkuo7ojrflj5bkuLvop5LlvLnot7PnmoTpq5jluqbvvIzlkozmjqfliLbkuLvop5LooYzliqjlvIDlhbNcclxuICAgIHBsYXllcjoge1xyXG4gICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICB0eXBlOiBjYy5Ob2RlXHJcbiAgICB9LFxyXG4gICAgc2NvcmVEaXNwbGF5OiB7XHJcbiAgICAgIGRlZmF1bHQ6IG51bGwsXHJcbiAgICAgIHR5cGU6IGNjLkxhYmVsXHJcbiAgICB9LFxyXG4gICAgc2NvcmVBdWRpbzoge1xyXG4gICAgICBkZWZhdWx0OiBudWxsLFxyXG4gICAgICB1cmw6IGNjLkF1ZGlvQ2xpcFxyXG4gICAgfVxyXG4gIH0sXHJcblxyXG4gIC8vIHVzZSB0aGlzIGZvciBpbml0aWFsaXphdGlvblxyXG4gIG9uTG9hZDogZnVuY3Rpb24oKSB7XHJcbiAgICAvLyDojrflj5blnLDlubPpnaLnmoQgeSDovbTlnZDmoIdcclxuICAgIHRoaXMuZ3JvdW5kWSA9IHRoaXMuZ3JvdW5kLnkgKyB0aGlzLmdyb3VuZC5oZWlnaHQgLyAyO1xyXG5cclxuICAgIC8vIOeUn+aIkOS4gOS4quaWsOeahOaYn+aYn1xyXG4gICAgdGhpcy50aW1lciA9IDA7XHJcbiAgICB0aGlzLnN0YXJEdXJhdGlvbiA9IDA7XHJcbiAgICB0aGlzLnNwYXduTmV3U3RhcigpO1xyXG4gICAgdGhpcy5zY29yZSA9IDA7XHJcbiAgICB0aGlzLmdldENhbnZhc1NpemUoKTtcclxuICB9LFxyXG4gIHNwYXduTmV3U3RhcjogZnVuY3Rpb24oKSB7XHJcbiAgICAvLyDkvb/nlKjnu5nlrprnmoTmqKHmnb/lnKjlnLrmma/kuK3nlJ/miJDkuIDkuKrmlrDoioLngrlcclxuICAgIHZhciBuZXdTdGFyID0gY2MuaW5zdGFudGlhdGUodGhpcy5zdGFyUHJlZmFiKTtcclxuICAgIC8vIOWwhuaWsOWinueahOiKgueCuea3u+WKoOWIsCBDYW52YXMg6IqC54K55LiL6Z2iXHJcbiAgICB0aGlzLm5vZGUuYWRkQ2hpbGQobmV3U3Rhcik7XHJcbiAgICAvLyDkuLrmmJ/mmJ/orr7nva7kuIDkuKrpmo/mnLrkvY3nva5cclxuICAgIG5ld1N0YXIuc2V0UG9zaXRpb24odGhpcy5nZXROZXdTdGFyUG9zaXRpb24oKSk7XHJcbiAgICAvLyDlsIZnYW1l57uE5Lu255qE5a6e5L6L5Lyg5YWl5pif5pif57uE5Lu2XHJcbiAgICBuZXdTdGFyLmdldENvbXBvbmVudCgnc3RhcicpLmdhbWUgPSB0aGlzO1xyXG4gICAgdGhpcy5zdGFyRHVyYXRpb24gPSB0aGlzLm1pblN0YXJEdXJhdGlvbiArIGNjLnJhbmRvbTBUbzEoKSAqICh0aGlzLm1heFN0YXJEdXJhdGlvbiAtIHRoaXMubWluU3RhckR1cmF0aW9uKTtcclxuICAgIHRoaXMudGltZXIgPSAwO1xyXG4gIH0sXHJcbiAgZ2V0Q2FudmFzU2l6ZTogZnVuY3Rpb24oKXtcclxuICAgIC8vIOWwhmdhbWXnu4Tku7bnmoTlrp7kvovkvKDlhaXmgKrniannu4Tku7ZcclxuICAgIHRoaXMucGxheWVyLmdldENvbXBvbmVudCgncGxheWVyJykuZ2FtZSA9IHRoaXM7XHJcbiAgfSxcclxuICBnZXROZXdTdGFyUG9zaXRpb246IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHJhbmRYID0gMDtcclxuICAgIC8vIOagueaNruWcsOW5s+mdouS9jee9ruWSjOS4u+inkui3s+i3g+mrmOW6pu+8jOmaj+acuuW+l+WIsOS4gOS4quaYn+aYn+eahCB5IOWdkOagh1xyXG4gICAgdmFyIHJhbmRZID0gdGhpcy5ncm91bmRZICsgY2MucmFuZG9tMFRvMSgpICogdGhpcy5wbGF5ZXIuZ2V0Q29tcG9uZW50KCdwbGF5ZXInKS5qdW1wSGVpZ2h0ICsgNTA7XHJcbiAgICAvLyDmoLnmja7lsY/luZXlrr3luqbvvIzpmo/mnLrlvpfliLDkuIDkuKrmmJ/mmJ8geCDlnZDmoIdcclxuICAgIHZhciBtYXhYID0gdGhpcy5ub2RlLndpZHRoIC8gMiAtIHRoaXMucGxheWVyLndpZHRoO1xyXG4gICAgcmFuZFggPSBjYy5yYW5kb21NaW51czFUbzEoKSAqIG1heFg7XHJcbiAgICAvLyDov5Tlm57mmJ/mmJ/lnZDmoIdcclxuICAgIHJldHVybiBjYy5wKHJhbmRYLCByYW5kWSk7XHJcbiAgfSxcclxuICBnYWluU2NvcmU6IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5zY29yZSArPSAxO1xyXG4gICAgLy8g5pu05pawIHNjb3JlRGlzcGxheSBMYWJlbCDnmoTmloflrZdcclxuICAgIHRoaXMuc2NvcmVEaXNwbGF5LnN0cmluZyA9ICdTY29yZTogJyArIHRoaXMuc2NvcmUudG9TdHJpbmcoKTtcclxuICAgIC8vIOaSreaUvuW+l+WIhumfs+aViFxyXG4gICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLnNjb3JlQXVpbywgZmFsc2UpO1xyXG4gIH0sXHJcbiAgZ2FtZU92ZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgdGhpcy5wbGF5ZXIuc3RvcEFsbEFjdGlvbnMoKTtcclxuICAgIGNjLmRpcmVjdG9yLmxvYWRTY2VuZSgnZ2FtZScpO1xyXG4gIH0sXHJcbiAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcclxuICB1cGRhdGU6IGZ1bmN0aW9uKGR0KSB7XHJcbiAgICBpZiAodGhpcy50aW1lciA+IHRoaXMuc3RhckR1cmF0aW9uKSB7XHJcbiAgICAgIHRoaXMuZ2FtZU92ZXIoKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgdGhpcy50aW1lciArPSBkdDtcclxuICB9LFxyXG59KTsiLCJjYy5DbGFzcyh7XHJcbiAgICBleHRlbmRzOiBjYy5Db21wb25lbnQsXHJcblxyXG4gICAgcHJvcGVydGllczoge1xyXG4gICAgICAgIC8vIOS4u+inkui3s+i3g+mrmOW6plxyXG4gICAgICAgIGp1bXBIZWlnaHQ6IDAsXHJcbiAgICAgICAgLy8g5Li76KeS6Lez6LeD5oyB57ut5pe26Ze0XHJcbiAgICAgICAganVtcER1cmF0aW9uOiAwLFxyXG4gICAgICAgIC8vIOacgOWkp+enu+WKqOmAn+W6plxyXG4gICAgICAgIG1heE1vdmVTcGVlZDogMCxcclxuICAgICAgICAvLyDliqDpgJ/luqZcclxuICAgICAgICBhY2NlbDogMCxcclxuICAgICAgICAvLyDot7Pot4Ppn7PmlYhcclxuICAgICAgICBqdW1wQXVkaW86IHtcclxuICAgICAgICAgICAgZGVmYXVsdDogbnVsbCxcclxuICAgICAgICAgICAgdXJsOiBjYy5BdWRpb0NsaXBcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG5cclxuICAgIHNldEp1bXBBY3RvbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIC8vIOi3s+i3g+S4iuWNh1xyXG4gICAgICAgIHZhciBqdW1wVXAgPSBjYy5tb3ZlQnkodGhpcy5qdW1wRHVyYXRpb24sIGNjLnAoMCwgdGhpcy5qdW1wSGVpZ2h0KSkuZWFzaW5nKGNjLmVhc2VDdWJpY0FjdGlvbk91dCgpKTtcclxuICAgICAgICAvLyDot7Pot4PkuIvpmY1cclxuICAgICAgICB2YXIganVtcERvd24gPSBjYy5tb3ZlQnkodGhpcy5qdW1wRHVyYXRpb24sIGNjLnAoMCwgLXRoaXMuanVtcEhlaWdodCkpLmVhc2luZyhjYy5lYXNlQ3ViaWNBY3Rpb25JbigpKTtcclxuXHJcbiAgICAgICAgdmFyIGNhbGxiYWNrID0gY2MuY2FsbEZ1bmModGhpcy5wbGF5SnVtcFNvdW5kLCB0aGlzKTtcclxuICAgICAgICByZXR1cm4gY2MucmVwZWF0Rm9yZXZlcihjYy5zZXF1ZW5jZShqdW1wVXAsIGp1bXBEb3duLCBjYWxsYmFjaykpO1xyXG5cclxuICAgIH0sXHJcbiAgICBwbGF5SnVtcFNvdW5kOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgY2MuYXVkaW9FbmdpbmUucGxheUVmZmVjdCh0aGlzLmp1bXBBdWRpbywgZmFsc2UpO1xyXG4gICAgfSxcclxuICAgIHNldElucHV0Q29udHJvbDogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICAvLyDmt7vliqDplK7nm5jmjqfliLZcclxuICAgICAgICBjYy5ldmVudE1hbmFnZXIuYWRkTGlzdGVuZXIoe1xyXG4gICAgICAgICAgICBldmVudDogY2MuRXZlbnRMaXN0ZW5lci5LRVlCT0FSRCxcclxuICAgICAgICAgICAgb25LZXlQcmVzc2VkOiBmdW5jdGlvbiAoa2V5Q29kZSwgZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoa2V5Q29kZSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgY2MuS0VZLmE6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjTGVmdCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NMZWZ0ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuYWNjUmlnaHQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgb25LZXlSZWxlYXNlZDogZnVuY3Rpb24gKGtleUNvZGUsIGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGtleUNvZGUpIHtcclxuICAgICAgICAgICAgICAgICAgICBjYXNlIGNjLktFWS5hOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmFjY0xlZnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSBjYy5LRVkuZDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5hY2NSaWdodCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sIHNlbGYubm9kZSk7XHJcbiAgICB9LFxyXG4gICAgb25QbGF5T3ZlcjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIGlmICh0aGlzLm5vZGUuZ2V0UG9zaXRpb24oKS54ID4gdGhpcy5vdmVyTGluZSAtIHRoaXMubm9kZS53aWR0aCkge1xyXG4gICAgICAgICAgICB0aGlzLm5vZGUueCA9IHRoaXMub3ZlckxpbmUgLSB0aGlzLm5vZGUud2lkdGg7XHJcbiAgICAgICAgICAgIHRoaXMueFNwZWVkID0gMFxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0aGlzLm5vZGUuZ2V0UG9zaXRpb24oKS54IDwgLXRoaXMub3ZlckxpbmUgKyB0aGlzLm5vZGUud2lkdGgpIHtcclxuICAgICAgICAgICAgdGhpcy5ub2RlLnggPSAtdGhpcy5vdmVyTGluZSArIHRoaXMubm9kZS53aWR0aDtcclxuICAgICAgICAgICAgdGhpcy54U3BlZWQgPSAwXHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXHJcbiAgICBvbkxvYWQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAvLyDliJ3lp4vljJbot7Pot4PliqjkvZxcclxuICAgICAgICB0aGlzLmp1bXBBY2l0b24gPSB0aGlzLnNldEp1bXBBY3RvbigpO1xyXG4gICAgICAgIHRoaXMubm9kZS5ydW5BY3Rpb24odGhpcy5qdW1wQWNpdG9uKTtcclxuICAgICAgICB0aGlzLmFjY0xlZnQgPSBmYWxzZTtcclxuICAgICAgICB0aGlzLmFjY1JpZ2h0ID0gZmFsc2U7XHJcbiAgICAgICAgdGhpcy54U3BlZWQgPSAwO1xyXG4gICAgICAgIHRoaXMuc2V0SW5wdXRDb250cm9sKCk7XHJcbiAgICAgICAgdGhpcy5vdmVyTGluZSA9IHRoaXMuZ2FtZS5ub2RlLndpZHRoIC8gMjtcclxuICAgICAgICBjYy5sb2codGhpcy5ub2RlLndpZHRoKTtcclxuICAgIH0sXHJcblxyXG4gICAgLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcclxuICAgIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XHJcbiAgICAgICAgaWYgKHRoaXMuYWNjTGVmdCkge1xyXG4gICAgICAgICAgICB0aGlzLnhTcGVlZCAtPSB0aGlzLmFjY2VsICogZHQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmFjY1JpZ2h0KSB7XHJcbiAgICAgICAgICAgIHRoaXMueFNwZWVkICs9IHRoaXMuYWNjZWwgKiBkdDtcclxuICAgICAgICB9O1xyXG4gICAgICAgIGlmIChNYXRoLmFicyh0aGlzLnhTcGVlZCkgPiB0aGlzLm1heE1vdmVTcGVlZCkge1xyXG4gICAgICAgICAgICB0aGlzLnhTcGVlZCA9IHRoaXMubWF4TW92ZVNwZWVkICogdGhpcy54U3BlZWQgLyBNYXRoLmFicyh0aGlzLnhTcGVlZCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLm5vZGUueCArPSB0aGlzLnhTcGVlZCAqIGR0O1xyXG4gICAgICAgIHRoaXMub25QbGF5T3ZlcigpO1xyXG4gICAgfSxcclxufSk7IiwiY2MuQ2xhc3Moe1xyXG4gIGV4dGVuZHM6IGNjLkNvbXBvbmVudCxcclxuXHJcbiAgcHJvcGVydGllczoge1xyXG4gICAgcGlja1JhZGl1czogMCxcclxuXHJcbiAgfSxcclxuXHJcbiAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXHJcbiAgb25Mb2FkOiBmdW5jdGlvbigpIHtcclxuXHJcbiAgfSxcclxuICBnZXRQbGF5ZXJEaXN0YW5jZTogZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcGxheWVyUG9zID0gdGhpcy5nYW1lLnBsYXllci5nZXRQb3NpdGlvbigpO1xyXG4gICAgdmFyIGRpc3QgPSBjYy5wRGlzdGFuY2UodGhpcy5ub2RlLnBvc2l0aW9uLCBwbGF5ZXJQb3MpO1xyXG4gICAgcmV0dXJuIGRpc3Q7XHJcbiAgfSxcclxuICBvblBpY2tlcjogZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmdhbWUuc3Bhd25OZXdTdGFyKCk7XHJcbiAgICB0aGlzLm5vZGUuZGVzdHJveSgpO1xyXG4gIH0sXHJcbiAgdXBkYXRlOiBmdW5jdGlvbihkdCkge1xyXG4gICAgaWYgKHRoaXMuZ2V0UGxheWVyRGlzdGFuY2UoKSA8IHRoaXMucGlja1JhZGl1cykge1xyXG4gICAgICB0aGlzLm9uUGlja2VkKCk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIHZhciBvcGFjaXR5UmF0aW8gPSAxIC0gdGhpcy5nYW1lLnRpbWVyIC8gdGhpcy5nYW1lLnN0YXJEdXJhdGlvbjtcclxuICAgIHZhciBtaW5PcGFjaXR5ID0gNTA7XHJcbiAgICB0aGlzLm5vZGUub3BhY2l0eSA9IG1pbk9wYWNpdHkgKyBNYXRoLmZsb29yKG9wYWNpdHlSYXRpbyAqICgyNTUgLSBtaW5PcGFjaXR5KSk7XHJcbiAgfSxcclxuICBvblBpY2tlZDogZnVuY3Rpb24oKSB7XHJcbiAgICB0aGlzLmdhbWUuc3Bhd25OZXdTdGFyKCk7XHJcbiAgICB0aGlzLmdhbWUuZ2FpblNjb3JlKCk7XHJcbiAgICB0aGlzLm5vZGUuZGVzdHJveSgpO1xyXG4gIH0sXHJcblxyXG5cclxufSk7Il0sInNvdXJjZVJvb3QiOiIifQ==