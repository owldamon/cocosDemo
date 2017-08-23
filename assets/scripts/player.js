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

    setJumpActon: function () {
        // 跳跃上升
        var jumpUp = cc.moveBy(this.jumpDuration, cc.p(0, this.jumpHeight)).easing(cc.easeCubicActionOut());
        // 跳跃下降
        var jumpDown = cc.moveBy(this.jumpDuration, cc.p(0, -this.jumpHeight)).easing(cc.easeCubicActionIn());

        var callback = cc.callFunc(this.playJumpSound, this);
        return cc.repeatForever(cc.sequence(jumpUp, jumpDown, callback));

    },
    playJumpSound: function () {
        cc.audioEngine.playEffect(this.jumpAudio, false);
    },
    setTouchControl: function () {
        this.game.node.on('touchstart', function (event) {
            if (event.getLocationX() > this.game.node.width / 2) {
                this.accLeft = false;
                this.accRight = true;
            } else {
                this.accLeft = true;
                this.accRight = false;
            }
        }, this)
        this.game.node.on('touchend', function (event) {
            this.accLeft = false;
            this.accRight = false;
        }, this)
    },
    setInputControl: function () {
        var self = this;
        // 添加键盘控制
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (keyCode, event) {
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
            onKeyReleased: function (keyCode, event) {
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
    onPlayOver: function () {
        if (this.node.getPosition().x > this.overLine - this.node.width) {
            this.node.x = this.overLine - this.node.width;
            this.xSpeed = 0
            return;
        }
        if (this.node.getPosition().x < -this.overLine + this.node.width) {
            this.node.x = -this.overLine + this.node.width;
            this.xSpeed = 0
            return;
        }
    },
    // use this for initialization
    onLoad: function () {
        // 初始化跳跃动作
        this.jumpAciton = this.setJumpActon();
        this.node.runAction(this.jumpAciton);
        this.accLeft = false;
        this.accRight = false;
        this.xSpeed = 0;
        this.setInputControl();
        this.setTouchControl()
        this.overLine = this.game.node.width / 2;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
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
    },
});