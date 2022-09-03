import plugin from '../../lib/plugins/plugin.js';
import { segment } from "oicq";
import { FrameToFrame, createEvent } from "../py-plugin/core/client/client.js";
import { imageUrlToBuffer } from "../py-plugin/core/util/transform.js";

// ！！！注意：此插件实现生成表情包功能需依赖[宵鸟py-plugin](https://gitee.com/realhuhu/py-plugin)的头像表情包模块

// 插件使用中如果遇到问题可@渔火反馈   渔糕就读的幼稚园：134086404
// 云崽插件库:https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index (码云)     https://github.com/yhArcadia/Yunzai-Bot-plugins-index (GitHub)


export class newcomer extends plugin {
  constructor() {
    super({
      name: '欢迎新人',
      dsc: '新人入群欢迎',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'notice.group.increase',
      priority: 4000
    })
  }

  /** 接受到消息都会执行一次 */
  async accept() {

    /** 定义入群欢迎内容 */
    let msg = '欢迎新人！';
    /** 冷却cd 30s */
    let cd = 30;

    if (this.e.user_id == Bot.uin) { return }

    /** cd */
    let key = `Yz:newcomers:${this.e.group_id}`;
    if (await redis.get(key)) { return }
    redis.set(key, '1', { EX: cd });

    /** 回复 */
    await this.reply([
      segment.at(this.e.user_id),
      // segment.image(),
      msg
    ])

    // 搓新人头像===============================\\
    let increasemem = ["_jiujiu", "_tightly", "_anyasuki", "_petpet", "_pat", "_play"];
    let imgbf = await imageUrlToBuffer(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${this.e.user_id}`);
    FrameToFrame({
      _package: "petpet",
      _handler: increasemem[Math.floor(Math.random() * increasemem.length)],
      params: {
        // event: await createEvent(this.e),
        event: {
          // sender: this.e.user_id,
          sender: {
            qq: this.e.user_id.toString(),
            name: "233",
            card: "233",
            sex: "233",
            age: "233",
            area: "233",
            level: "233",
            role: "233",
            title: "233",
          },
          atList: [{
            qq: this.e.user_id.toString(),
            name: this.e.user_id.toString(),
          }],
          imageList: [imgbf],
          msg: "",
          group: null
        },
        message: ""
      },
      onData: (error, response) => {
        if (error) {
          console.error(error.details);
        } else {
          this.reply(segment.image(response.image));
        }
      },
    });

    // // 生成搓新人的头像表情包
    // let url = `https://api.dlut-cc.live/emoji/?flag=_&qq=${this.e.user_id}&target=${this.e.user_id}&group=${this.e.group_id}&args=${encodeURI("搓")}&master=${cfg.masterQQ[0]}`
    // console.log(url);
    // //let response = await fetch(url); //调用接口获取数据
    // let response = await axios.get(url, { timeout: 20000 }); //调用接口获取数据
    // //const res = await response.json(); //结果json字符串转对象
    // const res = await response.data; //结果json字符串转对象
    // if (res.success == "true") {
    //   await this.reply([segment.at(this.e.user_id), segment.text(msg), segment.image(res.url)])
    // }
    // else {
    //   await this.reply([segment.at(this.e.user_id),segment.text(msg)])
    // }
  }
}

export class outNotice extends plugin {
  constructor() {
    super({
      name: '退群通知',
      dsc: 'xxx永远离开了我们',
      event: 'notice.group.decrease'
    })

    /** 退群提示词 */
    this.tips = '永远离开了我们。。'
  }

  async accept() {
    if (this.e.user_id == Bot.uin) {
      return
    }
    let name, msg;
    if (this.e.member) {
      name = this.e.member.card || this.e.member.nickname
    }

    if (name) {
      msg = `${name}(${this.e.user_id}) ${this.tips}`
    } else {
      msg = `${this.e.user_id} ${this.tips}`
    }



    // 缅怀旧人头像=============================================================================\\
    let decreasemem = ["_hammer", "_thump", "_rip", "_eat"];
    let imgbf = await imageUrlToBuffer(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${this.e.user_id}`);
    FrameToFrame({
      _package: "petpet",
      _handler: decreasemem[Math.floor(Math.random() * decreasemem.length)],
      params: {
        // event: await createEvent(this.e),
        event: {
          // sender: this.e.user_id,
          sender: {
            qq: this.e.user_id.toString(),
            name: "233",
            card: "233",
            sex: "233",
            age: "233",
            area: "233",
            level: "233",
            role: "233",
            title: "233",
          },
          atList: [{
            qq: this.e.user_id.toString(),
            name: this.e.user_id.toString(),
          }],
          imageList: [imgbf],
          msg: "",
          group: null
        },
        message: "缅怀"
      },
      onData: (error, response) => {
        if (error) {
          console.error(error.details);
        } else {
          this.reply(segment.image(response.image));
        }
      },
    });
    // =======================================================================//

    logger.mark(`[退出通知]${this.e.logText} ${msg}`);
    await this.reply(msg);
  }
}
