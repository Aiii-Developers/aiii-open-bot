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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const requestPromise = __importStar(require("request-promise"));
const cold_start_1 = __importDefault(require("./functions/cold-start"));
const line_webhook_class_1 = __importDefault(require("./methods/webhook/line-webhook.class"));
// import { keyboardMap } from './data/keywordMap';
const taiwanTodayPayload_1 = require("./template/taiwanTodayPayload");
const travelWarningInfo_1 = require("./template/travelWarningInfo");
const travelWarningPayload_1 = require("./template/travelWarningPayload");
// import { travelWarningNone } from './template/travelWarningNone';
const app = express_1.default();
app.use(cors_1.default({ origin: true }));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
const router = express_1.default.Router();
app.use('/', router);
router.get('/', cold_start_1.default); // 喚醒
let travelWarning;
let coronavirusCaseNum;
let lineWebhook;
const disableMap = {};
router.get('/reset', (req, res) => {
    travelWarning = null;
    coronavirusCaseNum = null;
    res.send('Reset cache');
});
function initTravelWarning() {
    return __awaiter(this, void 0, void 0, function* () {
        travelWarning = yield requestPromise.get('https://us-central1-aiii-bot-platform.cloudfunctions.net/travelWarning', {
            headers: {
                'cache-control': 'no-cache',
                'Content-Type': 'application/json',
            },
            json: true,
        });
        console.log('travelWarning=>', travelWarning);
    });
}
function initCoronavirusCaseNum() {
    return __awaiter(this, void 0, void 0, function* () {
        coronavirusCaseNum = yield requestPromise.get('https://us-central1-aiii-bot-platform.cloudfunctions.net/coronavirusCaseNum', {
            headers: {
                'cache-control': 'no-cache',
                'Content-Type': 'application/json',
            },
            json: true,
        });
        console.log('coronavirusCaseNum=>', coronavirusCaseNum);
    });
}
router.all('/webhook', (req, res) => {
    console.log('webhook start');
    if (!lineWebhook) {
        lineWebhook = new line_webhook_class_1.default({
            channelAccessToken: 'YhcQSZ3rdDwgVClpHgD3xAlWWp7WvbrCY56vEvdabElyA5t+UNSHWQ3kDkRUzpmPv14Uay/LkeWvq+xwNPPGgGO/XuOxVCkDrF2A6KkCpOwgTiZglNc8v+eFqn20CrqmLeUgVuxr1+I2lFmrORIoRAdB04t89/1O/w1cDnyilFU=',
            channelSecret: 'b5bcc5e8d50e3ac5c75c2afa4330bdfb',
        });
    }
    lineWebhook.setHandleText(/出國|旅遊|警示等級|了解各國疫情/, (event) => __awaiter(void 0, void 0, void 0, function* () {
        const { replyToken } = event;
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            lineWebhook.lineClient.replyMessage(replyToken, travelWarningInfo_1.travelWarningInfo);
        }
    }));
    lineWebhook.setHandleText(/台灣|臺灣|taiwan|武漢|肺炎|疾病|新冠肺炎快訊/i, (event) => __awaiter(void 0, void 0, void 0, function* () {
        const { replyToken } = event;
        if (!coronavirusCaseNum) {
            yield initCoronavirusCaseNum();
        }
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            lineWebhook.lineClient.replyMessage(replyToken, taiwanTodayPayload_1.taiwanTodayPayload('台灣', coronavirusCaseNum.taiwan['New cases'], coronavirusCaseNum.taiwan['Confirmed cases'], coronavirusCaseNum.taiwan.Deaths, coronavirusCaseNum['Last updated']));
        }
    }));
    lineWebhook.setHandleText(/閉嘴|吵死了|安靜|噓/, (event) => __awaiter(void 0, void 0, void 0, function* () {
        const { replyToken } = event;
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] = false;
            lineWebhook.replyText(replyToken, ['好的，噓~~~', '需要我時請說', 'oober']);
        }
    }));
    lineWebhook.setHandleText(/oober/, (event) => __awaiter(void 0, void 0, void 0, function* () {
        const { replyToken } = event;
        disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] = true;
        lineWebhook.replyText(replyToken, '我回來了');
    }));
    lineWebhook.setHandleText(/^#/, (event) => __awaiter(void 0, void 0, void 0, function* () {
        const { replyToken } = event;
        const message = event.message;
        let text = message.text.replace(/#/, '').toLocaleLowerCase();
        if (!travelWarning) {
            yield initTravelWarning();
        }
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            const payloadMessage = [];
            // _.forEach(keyboardMap, (regExp, key) => {
            //     if (regExp.test(text)) {
            //         text = key;
            //     }
            // });
            if (travelWarning[text]) {
                payloadMessage.push(travelWarningPayload_1.travelWarningPayload(text, travelWarning[text].severity_level, travelWarning[text].instruction));
                lineWebhook.lineClient.replyMessage(replyToken, payloadMessage);
            }
            else {
                // lineWebhook.lineClient.replyMessage(replyToken, travelWarningNone(text));
                text = '全球'; // 目前全球皆為三級
                lineWebhook.lineClient.replyMessage(replyToken, travelWarningPayload_1.travelWarningPayload(text, travelWarning[text].severity_level, travelWarning[text].instruction));
            }
        }
    }));
    lineWebhook.setHandleText(/.*/, (event) => __awaiter(void 0, void 0, void 0, function* () {
        const { replyToken } = event;
        const message = event.message;
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            if (!coronavirusCaseNum) {
                yield initCoronavirusCaseNum();
            }
            const key = message.text;
            if (!!key && coronavirusCaseNum[key]) {
                lineWebhook.lineClient.replyMessage(replyToken, taiwanTodayPayload_1.taiwanTodayPayload(key, coronavirusCaseNum[key]['New cases'], coronavirusCaseNum[key]['Confirmed cases'], coronavirusCaseNum[key].Deaths, coronavirusCaseNum['Last updated']));
            }
        }
    }));
    lineWebhook.lineWebhook(req, res);
});
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('🚀 Server ready at http://localhost:8080');
});
//# sourceMappingURL=index.js.map