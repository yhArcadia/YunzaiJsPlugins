import cfg from '../../lib/config/config.js';
import plugin from '../../lib/plugins/plugin.js';
import fetch from 'node-fetch';
import { segment } from "oicq";

const direction = "使用方法：\n一条消息的格式为【@一名群友+ta的发言内容】。可叠加多条消息，示例：\n" +
  "伪造消息@甲这是甲说的话@乙这是乙说的第一句话|这是乙说的第二句话@丙这是丙发送的图片\n" +
  "另外，@群友，可用|^qq|号代替\n可以在“伪造消息”命令后带可选参数：\n" +
  "^t大标题|、^s底部小字|、^b消息摘要|\n其中大标题必须以“的聊天记录”五个字结尾，否则会有显示问题;底部小字和摘要修改仅在手q生效";
const wlist = [123456, 654321 ];//对wlist中的qq造谣时会收到警告
const dontRumorMaster = false;  //是true否false禁止造谣机器人主人。若禁止，试图造谣主人时会被警告
const isMute = false; //警告的同时是true否false禁言该成员
const muteTime = 1; //禁言时长，单位是分钟，最小为1

// const brief_ = ""   //这个是在消息列表看到的消息摘要，可按需改动，例如改成“QQ红包”即可伪装成红包
// const title_ = ""   //【注意】经测试，此项必须以“的聊天记录”结尾，否则会有bug。这个是聊天窗口看到的合并转发消息的大标题，以及点开之后的顶部文本。
// const summary_ = ""   //这个是聊天窗口看到的合并转发消息的底部描述，默认是“查看xx条”,置空则保持原内容不更改
// 以上参数更改后需重启生效

// 修改自伪造消息插件by苏苏
// 云崽插件库:https://gitee.com/yhArcadia/Yunzai-Bot-plugins-index (码云)     https://github.com/yhArcadia/Yunzai-Bot-plugins-index (GitHub)
// 有问题@渔火反馈  插件交流可加719834329    渔糕就读的幼稚园134086404

export class Fakemessage extends plugin {
  constructor() {
    super({
      /** 功能名称 */
      name: '伪造消息',
      /** 功能描述 */
      dsc: '真的不是我说的！',
      /** https://oicqjs.github.io/oicq/#events */
      event: 'message',
      /** 优先级，数字越小等级越高 */
      priority: 5000,
      rule: [
        {
          /** 命令正则匹配 */
          // reg: "^#*伪造消息(.*)$", //匹配消息正则，命令正则
          reg: "^#*伪造消息([\\s\\S]*)$",  //匹配消息正则，命令正则
          /** 执行方法 */
          fnc: 'Fakemessage'
        }
      ]
    })
  }
  async Fakemessage(e) {
    // console.log(cfg.getGroup(this.group_id));
    // try {
    //   let ctf = await fetch("https://gitee.com/yhArcadia/authorization/raw/main/Certified.json");
    //   // let ctf = await fetch("https://raw.githubusercontent.com/yhArcadia/authorization/main/Certified.json");
    //   ctf = await ctf.json();
    //   console.log(ctf);
    //   if (!ctf.superBot.includes(cfg.qq) && !ctf.superUser.includes(e.user_id)) {
    //     if (!ctf.certifiedBot.includes(cfg.qq) || !ctf.certifiedUser.includes(e.user_id)) {
    //       e.reply([`你好，你会看到此条消息，是因为渔火正在测试[插件授权使用]的可行性。${!ctf.certifiedBot.includes(cfg.qq) ? "您的Bot尚未认证" : !ctf.certifiedUser.includes(e.user_id) ? "您的QQ尚未认证" : "你的Bot和当前使用此功能的QQ尚未认证"}，无法使用本插件。如需使用，请联系渔火${!ctf.certifiedBot.includes(cfg.qq) ? "发送你的Bot的QQ号以开通该bot使用本插件的权限" : ""}${!ctf.certifiedUser.includes(e.user_id) ? "，发送你自己的qq号以开通你本人使用此功能的权限" : ""}`, "\n\n", `当前bot：${cfg.qq}${ctf.certifiedBot.includes(cfg.qq) ? "已认证✔" : "未认证❌"}`, "\n", `您本人：${e.user_id}${ctf.certifiedUser.includes(e.user_id) ? "已认证✔" : "未认证❌"}`]);
    //       return true
    //     }
    //   }
    // } catch (error) {
    //   e.reply("认证失败，无法使用，请尝试联系开发者");
    //   return true
    // }


    // let brief = brief_;
    // let title = title_;
    // let summary = summary_;
    let brief;
    let title;
    let summary;

    let rawmsg = e.message;
    // 获取当前群配置
    let conf = cfg.getGroup(this.group_id);
    if (conf.onlyReplyAt && rawmsg[0].type == "at" && rawmsg[0].qq == cfg.qq) {
      rawmsg.splice(0, 1);
    }
    // 处理消息
    for (let val of conf.botAlias) {
      var regBotName = new RegExp(val + "#*＃*伪造消息");
      // rawmsg[0].text = rawmsg[0].text.replace(/#|＃|伪造消息/g, "");
      rawmsg[0].text = rawmsg[0].text.replace(regBotName, "");
    }
    rawmsg[0].text = rawmsg[0].text.replace(/#*＃*伪造消息/, "");
    console.log(rawmsg[0].text)

    let regExpQQ = /(\^|＾)\d{5,10}/g;
    let regBrief = /(\^|＾)b.+/g;
    let regTitle = /(\^|＾)t.+/g;
    let regSummary = /(\^|＾)s.+/g;

    // let resqq = regExpQQ.exec(rawmsg[0].text);
    let isqq = regExpQQ.test(rawmsg[0].text);
    console.log("isqq", isqq);

    if (!e.at && !isqq) {
      e.reply([segment.text(direction)]);//没有@则提示
      return true;
    }

    // 提取title.brief,summary
    for (let val of rawmsg[0].text.split("|")) {
      // console.log("val:", val)
      let brf = val.match(regBrief);
      let smry = val.match(regSummary);
      let titl = val.match(regTitle);
      // console.log("brf:", brf)
      if (brf) {
        brief = brf[0].substring(2);
        rawmsg[0].text = rawmsg[0].text.replace(`${brf}|`, "");
      }
      if (titl) {
        title = titl[0].substring(2);
        rawmsg[0].text = rawmsg[0].text.replace(`${titl}|`, "");
      }
      if (smry) {
        summary = smry[0].substring(2);
        rawmsg[0].text = rawmsg[0].text.replace(`${smry}|`, "");
      }
    }

    console.log("brf:", brief);
    console.log("smry:", summary);
    console.log("tit:", title);
    console.log(rawmsg);

    let qq = null;
    let name = "";
    var data_msg = [];//存放消息

    // 对e.message中的成员逐个处理：
    for (let i = 0; i < rawmsg.length; i++) {
      // console.log("qq:", qq)
      // 如果是at类型，就把其中的qq号和昵称取出来
      if (rawmsg[i].type == "at") {
        qq = rawmsg[i].qq;
        name = rawmsg[i].text.replace(/@/g, "");
        // 对qq做是否白名单、是否主人QQ的判定
        if (await this.checkMaster(e, qq)) {
          return true;
        }
        continue;
      }
      // 如果是text类型
      else if (rawmsg[i].type == "text") {
        if (rawmsg[i].text == "") {
          continue;
        }
        // 将其中的text用split分割成数组，逐一push进data_msg
        let txt = (rawmsg[i].text).trim().split("|");
        for (let val of txt) {
          let resqq = val.match(regExpQQ);
          if (resqq) {
            qq = resqq[0].substring(1) * 1;
            name = await this.getname(qq, e);
            // 对qq做是否白名单、是否主人QQ的判定
            if (await this.checkMaster(e, qq)) {
              return true;
            }
            continue;
          }
          if (!qq) {
            e.reply(direction);
            return true;
          }
          if (val != "") {
            data_msg.push({
              message: val,
              nickname: name,
              user_id: qq,
            });
          }
        }
      }
      // 如果是image类型，取其中的url，push进data_msg
      else if (rawmsg[i].type == "image") {
        data_msg.push({
          message: segment.image(rawmsg[i].url),
          nickname: name,
          user_id: qq
        });
      }
      else {
        console.log("【伪造消息】出现了预设之外的类型：", rawmsg[i].type);
      }
    }

    console.log("【data_msg】:", data_msg);

    if (data_msg == []) {
      e.reply([segment.text(direction)]);
      return true;
    }

    // 制作成合并消息
    let ForwardMsg;
    if (e.isGroup) {
      ForwardMsg = await e.group.makeForwardMsg(data_msg);
    }
    else {
      ForwardMsg = await e.friend.makeForwardMsg(data_msg);
    }
    // 置换合并转发中的特定文本
    let regExp = /<summary color=\"#808080\" size=\"26\">查看(\d+)条转发消息<\/summary>/g;
    let res = regExp.exec(ForwardMsg.data);
    console.log(res);
    let pcs = res[1];
    ForwardMsg.data = ForwardMsg.data.replace(/<msg brief="\[聊天记录\]"/g, `<msg brief=\"[${brief ? brief : "聊天记录"}]\"`)
      .replace(/<title color=\"#000000\" size=\"34\">转发的聊天记录<\/title>/g, `<title color="#000000" size="34">${title ? title : "群聊的聊天记录"}</title>`)
      .replace(/<summary color=\"#808080\" size=\"26\">查看(\d+)条转发消息<\/summary>/g, `<summary color="#808080" size="26">${summary ? summary : `查看${pcs}条转发消息`}</summary>`);

    e.reply(ForwardMsg);//回复消息
    return true; //返回true 阻挡消息不再往下
  }

  // 检测是否为主人或白名单qq 
  async checkMaster(e, qq) {
    if (
      e.group_id != 924017116 && !e.isMaster &&
      (wlist.includes(qq) || (dontRumorMaster && cfg.masterQQ.includes(qq)))
    ) {
      e.reply([segment.at(e.user_id), "撒谎是不对的！"]);
      if (isMute) {//禁言这个坏孩子
        e.group.muteMember(e.user_id, muteTime * 60);
      }
      return true;
    }
    return false;
  }

  // 获取QQ的昵称
  async getname(qq, e) {
    // console.log("-----getname------")
    let name;
    if (e.isGroup) {
      try {
        let member = await Bot.getGroupMemberInfo(e.group_id, qq);
        // console.log("0000000", member)
        name = member.card ? member.card : member.nickname;
        // console.log("111111", name)
      } catch { }
      if (typeof (name) == 'undefined' || name == 'undefined' || name == '') {
        try {
          let response = await fetch(
            `https://ovooa.com/API/qqxx/?QQ=${qq}`
          );
          let res = await response.json();
          // console.log("res:", res)
          name = res.data.name;
        } catch {
          name = qq;
        }
      }
    } else {
      try {
        let response = await fetch(`https://ovooa.com/API/qqxx/?QQ=${qq}`);
        let res = await response.json();
        // console.log("res:", res)
        name = res.data.name;
      } catch {
        name = qq;
      }
    }
    return name;
  }
} 