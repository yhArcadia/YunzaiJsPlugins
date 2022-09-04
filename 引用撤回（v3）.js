import { segment } from "oicq";
import cfg from '../../lib/config/config.js'
import common from "../../lib/common/common.js"
// 使用方法： 
// 1.主人：看到任意想要撤回的消息，对其回复“撤回”二字，即可撤回该条消息（若机器人不是管理员，则只能撤回机器人两分钟内的消息）
// 2.群员：若机器人发了不当消息，群员可以对该消息回复“撤回”，即可让机器人撤回该条消息。群员仅能撤回机器人发出的消息。
let grpMbPmt = true;  //此处设为true则群员可以撤回机器人的消息。设为false则只有主人能命令机器人撤回消息

// 云崽插件库:https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index (码云)     https://github.com/yhArcadia/Yunzai-Bot-plugins-index (GitHub)
// 有问题@渔火反馈

export class chehui extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '引用撤回',
      /** 功能描述 */
      dsc: '撤回目标消息',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          reg: "^撤回$",  //匹配消息正则，命令正则
          /** 执行方法 */
          fnc: 'chehui'
        },
      ]
    })
  }

  async chehui(e) {
    // console.log(e)
    // 判断是否为回复消息
    if (!e.source) {
      console.log("撤回消息：无撤回对象");
      return false;
    }
    // 获取原消息
    let source;
    if (e.isGroup) {
      source = (await e.group.getChatHistory(e.source.seq, 1)).pop();
    } else {
      source = (await e.friend.getChatHistory(e.source.time, 1)).pop();
    }

    let botname =  cfg.getGroup(this.group_id).botAlias[0]
    console.log(botname)
    // 判断权限
    if ((!e.group.is_owner && !e.group.is_admin&&source.sender.user_id!=cfg.qq) || ((source.sender.role == "owner" || source.sender.role == "admin") && !e.group.is_owner)) {
      e.reply("唔，" + botname + "做不到呢")
      return true
    }
    if ((e.sender.role == "admin" && !source.sender.role == "admin" && !source.sender.role == "owner" || e.sender.role == "owner")) {
      e.reply("请您自己动动手~")
      return true
    }

    // 撤回消息======================================================================================\\
    let target = null;
    if (e.isGroup) {
      target = e.group;
    } else {
      target = e.friend;
    }

    // 下面这部分回头来看写的很烂，一堆冗余代码，但是懒得优化了，反正不影响使用~~~~~
    if (target != null) {
      // 判断权限：命令者是主人 或者 命令者不是主任 && 目标消息的qq==机器人的qq && 群友撤回权限开启
      if (e.isMaster || (!e.isMaster && source.sender.user_id == BotConfig.account.qq && grpMbPmt)) {
        target.recallMsg(source.message_id);//撤回目标消息
        await common.sleep(300);//测试中同时撤回两条消息有概率出现第二条消息在退出该页面之前仍然存在的情况，所以这里间隔300ms

        let recallcheck;//这块代码用来检测目标消息是否已经被撤回-------------------------\\
        if (e.isGroup) {//获取本该被撤回的消息。分为群聊和私聊
          recallcheck = (await e.group.getChatHistory(e.source.seq, 1)).pop();
        } else {
          recallcheck = (await e.friend.getChatHistory(e.source.time, 1)).pop();
        }
        // console.log("recallcheck:", recallcheck);
        if (recallcheck) {//如果获取到值，说明目标消息还存在
          // console.log("没撤回");
          if (e.isGroup) { //是群聊
            //定义recallFailReply用于保存“撤回失败”的提醒消息，以便稍后把提醒消息也撤回
            let rclFailRpl;
            if (!e.group.is_admin && !e.group.is_owner)     //如果不是管理和群主
              rclFailRpl = await e.reply(botname + "不是管理员，无法撤回两分钟前的消息或别人的消息哦~");//“撤回失败”的提醒。这里感谢@pluto提供了发送消息的同时获取该条消息的方法
            else  //是管理
              rclFailRpl = await e.reply(botname + "无法撤回其他管理员和群主的消息哦~");

            await common.sleep(5000);//5秒后，把“撤回失败”的提醒撤回掉：
            source = (await e.group.getChatHistory(rclFailRpl.seq, 1)).pop();//获取消息内容
            await common.sleep(100);
            e.group.recallMsg(source.message_id);//撤回消息
          } else {          //是私聊
            let rclFailRpl = await e.reply(botname + "无法撤回自己两分钟前的消息和您的消息哦~");
            await common.sleep(5000);//5秒后，把提醒撤回掉：
            source = (await e.friend.getChatHistory(rclFailRpl.time, 1)).pop();//获取消息内容
            await common.sleep(100);
            e.friend.recallMsg(source.message_id);//撤回消息
          }
          return true;
        }//-------------------------------------------------------------------------//

        target.recallMsg(e.message_id);//撤回“撤回”命令
      }
    }//=============================================================================================//
    return true; //返回true 阻挡消息不再往下
  }
}