import { segment } from "oicq";
import fetch from "node-fetch";
import { roleId } from "../../config/genshin/roleId.js"

// 云崽插件库:https://gitee.com/Hikari666/Yunzai-Bot-plugins-index (码云)     https://github.com/HiArcadia/Yunzai-Bot-plugins-index (GitHub)
// 有问题@渔火反馈

export const rule = {
  genshinSpeak: {
    reg: "^#*(.*)说(.*)$",  //匹配消息正则，命令正则
    priority: 6000, //优先级，越小优先度越高
    describe: "", //【命令】功能说明
  },
  speakerList: {
    reg: "^#*音色列表$",  //匹配消息正则，命令正则
    priority: 5000, //优先级，越小优先度越高
    describe: "", //【命令】功能说明
  },
};


// 发言人列表
// 1.原神角色语音。 项目地址：https://github.com/w4123/vits 此接口需使用如下角色原名作为参数,如果需要在指令中用别称,请在url的speaker参数处自行映射回角色原名
const genshinSpeakers = ['派蒙', '凯亚', '安柏', '丽莎', '琴', '香菱', '枫原万叶', '迪卢克', '温迪', '可莉', '早柚', '托马', '芭芭拉', '优菈', '云堇', '钟离', '魈', '凝光', '雷电将军', '北斗', '甘雨', '七七', '刻晴', '神里绫华', '戴因斯雷布', '雷泽', '神里绫人', '罗莎莉亚', '阿贝多', '八重神子', '宵宫', '荒泷一斗', '九条裟罗', '夜兰', '珊瑚宫心海', '五郎', '散兵', '女士', '达达利亚', '莫娜', '班尼特', '申鹤', '行秋', '烟绯', '久岐忍', '辛焱', '砂糖', '胡桃', '重云', '菲谢尔', '诺艾尔', '迪奥娜', '鹿野院平藏']
// 2.其他音色语音。接口地址：https://www.duiopen.com/docs/ct_cloud_TTS_Voice  可在该地址查找音色id添加到下面的 otherSpeakers 中*(重启云崽生效)
const otherSpeakers = { "星爷": "zxcmp", "鬼": "juyinf_guigushi", "葛优": "geyoump", "四川话": "ppangf_csn", "粤语": "lunaif_ctn", "loli": "xbekef", "东北话": "xjingf_cdb", "然然": "qianranfa" }
// 3.柚子社语音 https://github.com/fumiama/MoeGoe   此接口返回速度较慢 仅支持日语转换
const youziSpeakers = { '绫地宁宁': 0, '因幡巡': 1, '朝武芳乃': 2, '常陆茉子': 3, '丛雨': 4, '鞍马小春': 5, '在原七海': 6 }


export async function genshinSpeak(e) {
  // e.reply([segment.text(Object.keys(roleId))])

  // 提取发言人和发言内容
  let data = e.msg.split("#").slice(-1)[0].split("说")
  while (data.length > 2) {
    data[1] = data[1].concat("说").concat(data[2])
    data.splice(2, 1)
  }

  // 如果发言内容或发言人为空则返回
  if (!data[1] || !data[0])
    return false

  // 将原神角色别称替换为角色原名
  for (let rolename of Object.values(roleId)) {
    // console.log(rolename)
    if (rolename.includes(data[0])) {
      data[0] = rolename[0]
      break
    }
  }

  console.log("【语音合成】 \n【音色】:", data[0], "\n【内容】:", data[1])

  // 以下三项参数仅对原神音色生效
  // 生成时使用的 noise_factor，可用于控制感情等变化程度。默认为0.667。
  let noise = 0.667
  // 生成时使用的 noise_factor_w，可用于控制音素发音长度变化程度。默认为0.8。
  let noisew = 0.8
  // 生成时使用的 length_factor，可用于控制整体语速。默认为1.2。
  let length = 1.3

  // 原神音色
  if (genshinSpeakers.includes(data[0])) {
    // 原神语音接口不支持阿拉伯数字,所以将数字转为汉字
    let text = data[1].split("")
    const num = { "1": "一", "2": "二", "3": "三", "4": "四", "5": "五", "6": "六", "7": "七", "8": "八", "9": "九", "0": "零" }
    for (let i = 0; i < text.length; i++) {
      if ((/\d/g).test(text[i]))
        text[i] = num[text[i]]
    }
    data[1] = text.join("")
    e.reply([segment.record(`http://233366.proxy.nscc-gz.cn:8888/?text=${encodeURI(data[1])}&speaker=${encodeURI(data[0])}&noise=${noise}&noisew=${noisew}&length=${length}`)])
    return true
  }

  // 其他音色
  else if (Object.keys(otherSpeakers).includes(data[0])) {
    e.reply([segment.record(`https://dds.dui.ai/runtime/v1/synthesize?voiceId=${otherSpeakers[data[0]]}&text=${encodeURI(data[1])}&speed=1&volume=150&audioType=wav`)])
    return true
  }

  // 柚子社音色
  else if (Object.keys(youziSpeakers).includes(data[0])) {
    // 翻译为日语
    let jptxt=await fetch (`http://www.iinside.cn:7001/api_req?reqmode=nmt_mt5_jez&password=3652&text=${encodeURI(data[1])}&order=zh2ja`)
    jptxt=await jptxt.json();
    console.log(jptxt.data)

    let url = `https://moegoe.azurewebsites.net/api/speak?text=${encodeURI(jptxt.data)}&id=${youziSpeakers[data[0]]}&format=mp3`;
    console.log(url)
    e.reply(["正在转换,请稍等~"]);
    
    try {
      let res = await fetch(url);
      console.log(res)
      if (res.status == 400) {
        e.reply("转换失败")
        return true
      }
      console.log(res.url)
      e.reply(segment.record(res.url))
    } catch (error) {
      e.reply([segment.text(error)])
    }
    return true
  }
  // 未匹配到则放行指令
  else
    return false
}

export async function speakerList(e) {
  e.reply(["原神音色，支持别称:\n", segment.text(genshinSpeakers), "\n\n柚子社音色:\n", segment.text(Object.keys(youziSpeakers)), "\n\n其他音色:\n", segment.text(Object.keys(otherSpeakers)), "\n\n格式: 音色+说+要说的话"])
  return true
}