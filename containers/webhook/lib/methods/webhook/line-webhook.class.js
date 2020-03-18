"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bot_sdk_1 = require("@line/bot-sdk");
const lodash_1 = __importDefault(require("lodash"));
class LineWebhook {
    constructor(lineConfig) {
        this.eventStack = [];
        this.userId = '';
        this.roomId = '';
        this.groupId = '';
        this.handleEvent = (event) => __awaiter(this, void 0, void 0, function* () {
            console.log('event:', JSON.stringify(event));
            switch (event.type) {
                case 'message':
                    const { message } = event;
                    switch (message.type) {
                        case 'text':
                            return this.handleText(event);
                        case 'image':
                            return this.handleImage(event);
                        case 'video':
                            return this.handleVideo(event);
                        case 'audio':
                            return this.handleAudio(event);
                        case 'file':
                            return this.handleFile(event);
                        case 'location':
                            return this.handleLocation(event);
                        case 'sticker':
                            return this.handleSticker(event);
                        default:
                            throw new Error(`Unknown message: ${JSON.stringify(message)}`);
                    }
                // 加入好友
                case 'follow':
                    return this.handleFollow(event);
                // bot被封鎖
                case 'unfollow':
                    return this.handleUnfollow(event);
                // 加入群組或聊天室
                case 'join':
                    return this.handleJoin(event);
                // 從群組刪除
                case 'leave':
                    console.log(`Left: ${JSON.stringify(event)}`);
                    return this.handleLeave(event);
                // template message 回傳 action
                case 'postback':
                    return this.handlePostback(event);
                case 'beacon':
                    return this.handleBeacon(event);
                default:
                    throw new Error(`Unknown event: ${JSON.stringify(event)}`);
            }
        });
        this.handleText = (event) => __awaiter(this, void 0, void 0, function* () {
            console.log('text', JSON.stringify(event));
            const message = event.message;
            const { userId } = event.source;
            if (!userId) {
                throw Error('no userId');
            }
            for (const item of this.eventStack) {
                if (item.type === 'text' && (typeof item.eventName === 'string' ? item.eventName === message.text
                    : item.eventName.test(message.text))) {
                    return item.callback(event);
                }
            }
            return this.replyText(event.replyToken, '收到');
        });
        this.handleImage = (event) => __awaiter(this, void 0, void 0, function* () { return this.replyText(event.replyToken, '收到'); });
        this.handleVideo = (event) => __awaiter(this, void 0, void 0, function* () { return this.replyText(event.replyToken, '收到'); });
        this.handleAudio = (event) => __awaiter(this, void 0, void 0, function* () { return this.replyText(event.replyToken, '收到'); });
        this.handleFile = (event) => __awaiter(this, void 0, void 0, function* () { return this.replyText(event.replyToken, '收到'); });
        this.handleLocation = (event) => __awaiter(this, void 0, void 0, function* () { return this.replyText(event.replyToken, '收到'); });
        this.handleSticker = (event) => __awaiter(this, void 0, void 0, function* () { return this.replyText(event.replyToken, '收到'); });
        this.handleFollow = (event) => __awaiter(this, void 0, void 0, function* () {
            return this.lineClient.replyMessage(event.replyToken, {
                type: 'flex',
                altText: '嗨！我是OOber疫',
                contents: {
                    type: 'bubble',
                    direction: 'ltr',
                    body: {
                        type: 'box',
                        layout: 'vertical',
                        contents: [
                            {
                                type: 'text',
                                text: '嗨！我是OOber疫，如果你想知道關於武漢疫情的資訊，請輸入：',
                                align: 'start',
                                gravity: 'center',
                                weight: 'regular',
                                color: '#535353',
                                wrap: true,
                            },
                            {
                                type: 'text',
                                text: '「武漢」、「肺炎」、「疾病」、「新冠肺炎快訊」等字詞',
                                margin: 'lg',
                                weight: 'bold',
                                color: '#FF5D5D',
                                wrap: true,
                            },
                            {
                                type: 'text',
                                text: '若最近剛好要出國玩，想了解各國警示等級，請輸入：',
                                margin: 'lg',
                                wrap: true,
                            },
                            {
                                type: 'text',
                                text: '「出國」、「旅遊」、「警示等級」、「了解各國疫情」等字詞',
                                margin: 'lg',
                                weight: 'bold',
                                color: '#FF5D5D',
                                wrap: true,
                            },
                        ],
                    },
                },
            });
        });
        this.handleUnfollow = (event) => __awaiter(this, void 0, void 0, function* () {
            console.log(`被封鎖： ${JSON.stringify(event)}`);
        });
        this.handleJoin = (event) => __awaiter(this, void 0, void 0, function* () { return this.replyText(event.replyToken, `Joined ${event.source.type}`); });
        this.handleLeave = (event) => __awaiter(this, void 0, void 0, function* () {
            console.log(`Left ${event.source.type}`);
            return null;
        });
        this.handlePostback = (event) => __awaiter(this, void 0, void 0, function* () {
            console.log(`postback: ${JSON.stringify(event)}`);
        });
        this.handleBeacon = (event) => __awaiter(this, void 0, void 0, function* () { return this.replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`); });
        this.lineClient = new bot_sdk_1.Client(lineConfig);
    }
    lineWebhook(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (req.method === 'GET') {
                res.send('line webhook cold start');
                return null;
            }
            console.log('line-webhook headers:', JSON.stringify(req.headers));
            console.log('line-webhook body = ', JSON.stringify(req.body));
            this.userId = req.body.events[0].source.userId || '';
            this.roomId = req.body.events[0].source.roomId || '';
            this.groupId = req.body.events[0].source.groupId || '';
            console.log({
                userId: this.userId,
                roomId: this.roomId,
                groupId: this.groupId,
            });
            // line webhook 驗證用
            if (this.userId === 'Udeadbeefdeadbeefdeadbeefdeadbeef') {
                res.end();
            }
            return Promise.all(lodash_1.default.map(req.body.events, this.handleEvent))
                .then(() => {
                res.end();
            })
                .catch((err) => {
                console.error(err);
                res.status(500).end();
            });
        });
    }
    /**
   * 設定 text 事件
   * @param eventName 觸發文字(string 或 正規表達式)
   * @param callback 自訂的函式
   */
    setHandleText(eventName, callback) {
        this.eventStack.push({
            eventName,
            type: 'text',
            callback,
        });
    }
    /**
     * 回覆文字訊息
     * @param replyToken
     * @param texts
     */
    replyText(replyToken, texts) {
        const textArray = lodash_1.default.isArray(texts) ? texts : [texts];
        const messages = lodash_1.default.map(textArray, (text) => ({ type: 'text', text }));
        return this.lineClient.replyMessage(replyToken, messages);
    }
}
exports.default = LineWebhook;
//# sourceMappingURL=line-webhook.class.js.map