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
const app = express_1.default();
app.use(cors_1.default({ origin: true }));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
const router = express_1.default.Router();
app.use('/', router); // https://api-dnz3lqp74q-an.a.run.app/**
app.use('/api', router); // https://s.aiii.ai/api/**
router.get('/', cold_start_1.default); // 喚醒
let travelWarning;
let coronavirusCaseNum;
let lineWebhook;
router.all('/webhook', (req, res) => {
    console.log('webhook start');
    if (!lineWebhook) {
        lineWebhook = new line_webhook_class_1.default({
            channelAccessToken: 'YhcQSZ3rdDwgVClpHgD3xAlWWp7WvbrCY56vEvdabElyA5t+UNSHWQ3kDkRUzpmPv14Uay/LkeWvq+xwNPPGgGO/XuOxVCkDrF2A6KkCpOwgTiZglNc8v+eFqn20CrqmLeUgVuxr1+I2lFmrORIoRAdB04t89/1O/w1cDnyilFU=',
            channelSecret: 'b5bcc5e8d50e3ac5c75c2afa4330bdfb',
        });
    }
    lineWebhook.setHandleText(/^#/, (event) => __awaiter(void 0, void 0, void 0, function* () {
        const message = event.message;
        const { replyToken } = event;
        if (!travelWarning) {
            travelWarning = yield requestPromise.get('https://us-central1-aiii-bot-platform.cloudfunctions.net/travelWarning', {
                headers: {
                    'cache-control': 'no-cache',
                    'Content-Type': 'application/json',
                },
                json: true,
            });
        }
        console.log('travelWarning=>', travelWarning);
        const messageHashTag = message.text.replace(/#/, '');
        if (travelWarning[messageHashTag]) {
            lineWebhook.replyText(replyToken, [
                messageHashTag,
                travelWarning[messageHashTag].instruction || '-',
                travelWarning[messageHashTag].severity_level || '-',
            ]);
        }
        else {
            lineWebhook.replyText(replyToken, JSON.stringify(travelWarning));
        }
    }));
    lineWebhook.setHandleText(/台灣/, (event) => __awaiter(void 0, void 0, void 0, function* () {
        // const message = event.message as TextEventMessage;
        const { replyToken } = event;
        if (!coronavirusCaseNum) {
            coronavirusCaseNum = yield requestPromise.get('https://us-central1-aiii-bot-platform.cloudfunctions.net/coronavirusCaseNum', {
                headers: {
                    'cache-control': 'no-cache',
                    'Content-Type': 'application/json',
                },
                json: true,
            });
        }
        console.log('coronavirusCaseNum=>', coronavirusCaseNum);
        lineWebhook.replyText(replyToken, `通報：${coronavirusCaseNum['Confirmed cases']}
死亡：${coronavirusCaseNum.Deaths}`);
    }));
    lineWebhook.lineWebhook(req, res);
});
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('🚀 Server ready at http://localhost:8080');
});
//# sourceMappingURL=index.js.map