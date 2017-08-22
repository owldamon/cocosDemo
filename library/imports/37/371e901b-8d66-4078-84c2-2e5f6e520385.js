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