import { segment } from "oicq";
// import { getGroupMemberInfo } from "oicq";
import fetch from "node-fetch";
import lodash from "lodash";

// 使用方法：
// #二次元的我
// #我的成分
// #答案之书+你心中的疑惑
// #观音灵签
// #看头像@xx    #看头像自己
// #神之眼@xx    #神之眼自己
// #藏头诗五言九章是男同（默认五言，可以不用带）  #藏尾诗七律是男同


// v1.1~1.2 俺也忘了改啥了
// v1.3 新增观音灵签
// v1.4 新增看头像功能
// v1.5 新增查看神之眼（根据QQ生成属性）
// v1.5.1 修复雷系神之眼undefined，加了头像和神之眼的开关
// v1.6 新增藏头诗藏尾诗


// 如有问题和建议可以@渔火反馈

//项目路径
const _path = process.cwd();
//=============================这里更改相关设置==================\\
// 这里是各功能的开关，改为false即可关闭功能
let ercy = true;     //二次元的我
let chengfen = true; //我的成分
let daan = true;     //答案之书
let qiuqian = true;  //观音灵签
let kantouxiang = true;  //看头像
let shenzhiyan = true;  //看神之眼
let cangtou = true;      //藏头诗

// 这里设置是否开启CD，设为true则有CD
let ercyCD = true;      //二次元的我
let chengfenCD = false;  //我的成分
let daanCD = false;      //答案之书
let qiuqianCD = false;   //观音灵签

// 这里设置CD时长，单位是分钟，不建议写0会出现未知冗余
let ercy_time = 30;     //二次元的我 
let chengfen_time = 1; //我的成分 
let daan_time = 1;     //答案之书
let qiuqian_time = 1;  //观音灵签
//==============================================================//

//1.定义命令规则
export const rule = {

  ercyFUN: {
    reg: "^#*二次元的我$", //匹配消息正则，命令正则
    priority: 5000, //优先级，越小优先度越高
    describe: "【#二次元的我】查看我的二次元属性", //【命令】功能说明
  },
  chengfenFUN: {
    reg: "^#*我的成分$", //匹配消息正则，命令正则
    priority: 5000, //优先级，越小优先度越高
    describe: "【#我的成分】查看你是由什么组成的", //【命令】功能说明
  },
  daanFUN: {
    reg: "^#*答案之书(.*)$", //匹配消息正则，命令正则
    priority: 5000, //优先级，越小优先度越高
    describe: "【#答案之书】会告诉你答案", //【命令】功能说明
  },
  qiuqianFUN: {
    reg: "^#*观音灵签$", //匹配消息正则，命令正则
    priority: 300, //优先级，越小优先度越高
    describe: "【#观音灵签】看看今天的运势", //【命令】功能说明
  },
  kantouxiangFUN: {
    reg: "^#*看头像(.*)$", //匹配消息正则，命令正则
    priority: 5000, //优先级，越小优先度越高
    describe: "【头像@xxx】看看头像大图", //【命令】功能说明
  },
  shenzhiyanFUN: {
    reg: "^#*神之眼(.*)$", //匹配消息正则，命令正则
    priority: 5000, //优先级，越小优先度越高
    describe: "【神之眼@xxx】看看ta的神之眼", //【命令】功能说明
  },
  cangtouFUN: {
    reg: "^#*藏(头|尾)诗(.*)$", //匹配消息正则，命令正则
    priority: 5000, //优先级，越小优先度越高
    describe: "【藏头诗九章是男同】生成藏头诗", //【命令】功能说明
  },
};

//二次元的我===========================================================================
export async function ercyFUN(e) {
  if (!ercy) return true;

  let data = await redis.get(`Yunzai:setlinshimsg:${e.user_id}_ercy`); //先获取这个逼 看看有没有去进程在线
  if (data) {
    console.log(data)
    data = JSON.parse(data)
    if (ercyCD) {
      if (data.num != 0) {
        e.reply([segment.at(e.user_id), "该命令有" + ercy_time + "分钟CD~"]);
        return true;
      }
    }
  }

  let url = `http://ovooa.com/API/Ser/api?name=${e.sender.card}『${lodash.random(0, 100)}』&type=json`;
  let response = await fetch(url);
  let res = await response.json();

  if (res.code == -1) {
    e.reply("参数错误！");
    return true
  }
  res.text = res.text.replace(/『(.+?)』/g, "");

  let msg = [
    //@用户
    // segment.at(e.user_id), 
    // "\n",
    //头像
    //segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`),
    //用户的二次元属性
    segment.text(res.text)
  ];

  e.reply(msg);

  redis.set(`Yunzai:setlinshimsg:${e.user_id}_ercy`, `{"num":1,"booltime":${ercyCD}}`, { //写入缓存值
    EX: parseInt(60 * ercy_time)
  });

  return true; //返回true 阻挡消息不再往下
}

//我的成分====================================================================================
export async function chengfenFUN(e) {
  if (!chengfen) return true;
  let data = await redis.get(`Yunzai:setlinshimsg:${e.user_id}_chengfen`); //先获取这个逼 看看有没有去进程在线
  if (data) {
    console.log(data)
    data = JSON.parse(data)
    if (chengfenCD) {
      if (data.num != 0) {
        e.reply([segment.at(e.user_id), "该命令有" + chengfen_time + "分钟CD~"]);
        return true;
      }
    }
  }

  let url = `http://ovooa.com/API/name/api.php?msg=${e.sender.card}『${lodash.random(0, 100)}』&type=json`;
  let response = await fetch(url);
  let res = await response.json();

  if (res.code == -1) {
    e.reply("参数错误！");
    return true
  }

  res.text = res.text.replace(/『(.+?)』/g, "")
  res.text = res.text.replace("泡在福尔马林里面的内脏", "沾着晨露的小黄花").trim();
  res.text = res.text.replace(/“|”/g, "").trim();
  let msg = [
    //@用户
    // segment.at(e.user_id),
    // "\n",
    //头像
    // segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`),
    //用户的成分
    segment.text(res.text)
  ];

  e.reply(msg);

  redis.set(`Yunzai:setlinshimsg:${e.user_id}_chengfen`, `{"num":1,"booltime":${chengfenCD}}`, { //写入缓存值
    EX: parseInt(60 * chengfen_time)
  });

  return true; //返回true 阻挡消息不再往下
}


// 答案之书================================================================
export async function daanFUN(e) {
  if (!daan) return true;
  try {
    let data = await redis.get(`Yunzai:setlinshimsg:${e.user_id}_daan`); //先获取这个逼 看看有没有去进程在线
    if (data) {
      console.log(data)
      data = JSON.parse(data)
      if (daanCD) {
        if (data.num != 0) {
          e.reply([segment.at(e.user_id), "该命令有" + daan_time + "分钟CD~"]);
          return true;
        }
      }
    }

    let url = `http://ovooa.com/API/daan/api?type=json`;
    let response = await fetch(url);
    let res = await response.json();

    let msg = [
      //@用户
      // segment.at(e.user_id), 
      // "\n",
      //头像
      //segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`),
      // "\n",
      segment.text(res.data.zh),
      "\n",
      segment.text(res.data.en),
    ];

    e.reply(msg, true);

    redis.set(`Yunzai:setlinshimsg:${e.user_id}_daan`, `{"num":1,"booltime":${daanCD}}`, { //写入缓存值
      EX: parseInt(60 * daan_time)
    });
  } catch (error) {
    let msg = [
      "给答案之书整不会了",
      segment.image("https://c2cpicdw.qpic.cn/offpic_new/1761869682//1761869682-4172686859-71B1FBA58A05D2C62802B570F00A4CFB/0?term=3"),
    ];
    e.reply(msg, true);
    return true;
  }
  return true; //返回true 阻挡消息不再往下
}


//观音灵签===========================================================================
export async function qiuqianFUN(e) {
  console.log("1");
  if (!qiuqian) return true;

  let data = await redis.get(`Yunzai:setlinshimsg:${e.user_id}_qiuqian`); //先获取这个逼 看看有没有去进程在线
  if (data) {
    console.log(data)
    data = JSON.parse(data)
    if (qiuqianCD) {
      if (data.num != 0) {
        e.reply([segment.at(e.user_id), "该命令有" + qiuqian_time + "分钟CD~"]);
        return true;
      }
    }
  }

  // let url = `http://ovooa.com/API/Ser/api?name=${e.sender.card}『${lodash.random(0, 100)}』&type=json`;
  let url = `http://ovooa.com/API/chouq/api.php`;
  let response = await fetch(url);
  let res = await response.json();
  console.log(res);


  if (res.code != 1) {
    e.reply("出错了哦~");
    return true
  }

  let msg = [
    //@用户
    segment.at(e.user_id),
    "\n第", segment.text(res.data.format), "签：", segment.text(res.data.draw), "\n",
    segment.image(res.data.image),
    "【解日】：", segment.text(res.data.explain), "\n",
    "【仙机】：", segment.text(res.data.details), "\n",
    "【签语】：", segment.text(res.data.annotate), "\n",
    "【起源】：", segment.text(res.data.source),
  ];

  e.reply(msg);

  redis.set(`Yunzai:setlinshimsg:${e.user_id}_qiuqian`, `{"num":1,"booltime":${qiuqianCD}}`, { //写入缓存值
    EX: parseInt(60 * qiuqian_time)
  });

  return true; //返回true 阻挡消息不再往下
}

//看头像大图===========================================================================
export async function kantouxiangFUN(e) {
  if (!e.isGroup || !kantouxiang) return false;
  if (e.msg.match('自己')) {
    e.reply(segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.user_id}`))
    return true
  }
  if (!e.at) {
    e.reply("发送看头像@xx，可以快捷查看ta的头像哦~")
    return true
  }
  e.reply(segment.image(`https://q1.qlogo.cn/g?b=qq&s=0&nk=${e.at}`))
  return true; //返回true 阻挡消息不再往下
}

//看神之眼===========================================================================
export async function shenzhiyanFUN(e) {
  if (!shenzhiyan) return false;
  if (!e.msg.match('自己') && !e.at) {
    e.reply("发送神之眼@xx，或者神之眼自己，可以查看ta的和你的神之眼哦~")
    return true
  }

  // console.log(e)
  var dic = {
    0: "https://gchat.qpic.cn/gchatpic_new/1761869682/1023102458-2849443945-C7F8992AD44A89FD12E043C97F9B4B3F/0?term=3",//火神之眼图片
    1: "https://gchat.qpic.cn/gchatpic_new/1761869682/1023102458-3000881371-7B8A998923FA5A50E85559A15EEED082/0?term=3",//水神之眼图片
    2: "https://gchat.qpic.cn/gchatpic_new/1761869682/1023102458-3197120511-DB03E53C7279DB17DA7BA46D3F8B930C/0?term=3",  //冰神之眼图片
    3: "https://gchat.qpic.cn/gchatpic_new/1761869682/1023102458-2895037012-DE3813A9147D4D9820B76677B61BDF91/0?term=3",//风神之眼图片
    4: "https://gchat.qpic.cn/gchatpic_new/1761869682/1023102458-2995945814-9E11498825D98086AA1C5EDC5E8B224B/0?term=3",//雷神之眼图片
    5: "https://gchat.qpic.cn/gchatpic_new/1761869682/1023102458-3164811676-0F706954315979715490227CC653F8EA/0?term=3",//草神之眼图片
    6: "https://gchat.qpic.cn/gchatpic_new/1761869682/1023102458-3113929476-4E53C2897724F4FA9DE12EF128A17634/0?term=3"//岩神之眼图片
  }
  var dic2 = { 0: "火", 1: "水", 2: "冰", 3: "风", 4: "雷", 5: "草", 6: "岩" }
  let qq = 0;
  let name = "";
  if (e.msg.match('自己')) {
    qq = e.user_id * 1;
    name = e.sender.card;
  } else if (e.at) {
    qq = e.at * 1
    let member = await Bot.getGroupMemberInfo(e.group_id, e.at).catch((err) => { })
    // console.log(member)
    name = member.nickname
  } else return true;

  let type = qq % 7;
  let msg = [
    `${name}的神之眼是${dic2[type]}属性哦`,
    segment.image(dic[type])
  ]
  e.reply(msg)

  return true; //返回true 阻挡消息不再往下
}


//藏头诗===========================================================================
export async function cangtouFUN(e) {
  if (!cangtou) return false;
  let a=1
  let b = 5
  if (e.msg.match('藏头诗')) {
    a = 1
  } else if (e.msg.match('藏尾诗')) {
    a = 0
  } else return false
  if (e.msg.match('五言')) {
    b = 5
  } else if (e.msg.match('七律')) {
    b = 7
  }
  let msg = e.msg.replace(/#|藏头诗|藏尾诗|五言|七律/g, "").trim();
  var reg = /[\u4e00-\u9fa5]/g;
  msg=msg.match(reg).join("");
  if (!msg) return false;
  // console.log(msg);
  let url = `http://xiaobai.klizi.cn/API/other/betan.php?msg=${msg}&a=${a}&b=${b}`;
  let response = await fetch(url);
  let res = await response.text();
  // e.reply(msg);
  e.reply(segment.text(res));
  return true; //返回true 阻挡消息不再往下
}