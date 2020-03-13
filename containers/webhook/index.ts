import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as requestPromise from 'request-promise';
import { TextEventMessage } from '@line/bot-sdk';
import _ from 'lodash';
import coldStart from './functions/cold-start';
import LineWebhook from './methods/webhook/line-webhook.class';
import { keyboardMap } from './data/keywordMap';
import { taiwanTodayPayload } from './template/taiwanTodayPayload';
import { travelWarningPayload } from './template/travelWarningPayload';


const app = express();
app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
const router = express.Router();
app.use('/', router); // https://api-dnz3lqp74q-an.a.run.app/**
app.use('/api', router); // https://s.aiii.ai/api/**
router.get('/', coldStart); // 喚醒

let travelWarning: any;
let coronavirusCaseNum: any;
let lineWebhook: LineWebhook;

const disableMap: {
    [roomId: string]: boolean;
} = {};


async function initTravelWarning() {
    travelWarning = await requestPromise.get('https://us-central1-aiii-bot-platform.cloudfunctions.net/travelWarning', {
        headers:
        {
            'cache-control': 'no-cache',
            'Content-Type': 'application/json',
        },
        json: true,
    });

    console.log('travelWarning=>', travelWarning);
}

async function initCoronavirusCaseNum() {
    coronavirusCaseNum = await requestPromise.get('https://us-central1-aiii-bot-platform.cloudfunctions.net/coronavirusCaseNum', {
        headers:
        {
            'cache-control': 'no-cache',
            'Content-Type': 'application/json',
        },
        json: true,
    });

    console.log('coronavirusCaseNum=>', coronavirusCaseNum);
}

router.all('/webhook', (req: express.Request, res: express.Response) => {
    console.log('webhook start');
    if (!lineWebhook) {
        lineWebhook = new LineWebhook({
            channelAccessToken: 'YhcQSZ3rdDwgVClpHgD3xAlWWp7WvbrCY56vEvdabElyA5t+UNSHWQ3kDkRUzpmPv14Uay/LkeWvq+xwNPPGgGO/XuOxVCkDrF2A6KkCpOwgTiZglNc8v+eFqn20CrqmLeUgVuxr1+I2lFmrORIoRAdB04t89/1O/w1cDnyilFU=',
            channelSecret: 'b5bcc5e8d50e3ac5c75c2afa4330bdfb',
        });
    }

    lineWebhook.setHandleText(/台灣|臺灣|taiwan/i, async (event) => {
        // const message = event.message as TextEventMessage;
        const { replyToken } = event;
        if (!coronavirusCaseNum) {
            await initCoronavirusCaseNum();
        }
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            lineWebhook.lineClient.replyMessage(replyToken, taiwanTodayPayload(
                '台灣',
                coronavirusCaseNum.taiwan['Confirmed cases'],
                coronavirusCaseNum.taiwan.Deaths,
            ));
        }
    });

    lineWebhook.setHandleText(/^#/, async (event) => {
        const { replyToken } = event;
        const message = event.message as TextEventMessage;
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            if (!coronavirusCaseNum) {
                await initCoronavirusCaseNum();
            }

            const key = message.text.replace(/#/, '').toLocaleLowerCase();

            if (!!key && coronavirusCaseNum[key]) {
                lineWebhook.lineClient.replyMessage(replyToken, taiwanTodayPayload(
                    key,
                    coronavirusCaseNum[key]['Confirmed cases'],
                    coronavirusCaseNum[key].Deaths,
                ));
            } else {
                lineWebhook.lineClient.replyMessage(replyToken, taiwanTodayPayload(
                    '台灣',
                    coronavirusCaseNum.taiwan['Confirmed cases'],
                    coronavirusCaseNum.taiwan.Deaths,
                ));
            }
        }
    });

    lineWebhook.setHandleText(/閉嘴|吵死了/, async (event) => {
        const { replyToken } = event;
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] = false;
            lineWebhook.replyText(replyToken, ['好的，噓~~~', '需要我時請說', 'oober疫大神歸位!!']);
        }
    });

    lineWebhook.setHandleText(/oober疫大神/, async (event) => {
        const { replyToken } = event;
        disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] = true;
        lineWebhook.replyText(replyToken, '我離開了，我又回來了，咬我啊笨蛋');
    });

    lineWebhook.setHandleText(/.*/, async (event) => {
        const { replyToken } = event;
        const message = event.message as TextEventMessage;
        if (!travelWarning) {
            await initTravelWarning();
        }

        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            const payloadMessage: any = [];
            let isComplete = false;
            _.forEach(keyboardMap, (regExp, key) => {
                if (!isComplete && regExp.test(message.text)) {
                    isComplete = true;
                    payloadMessage.push(travelWarningPayload(key, travelWarning[key].severity_level, travelWarning[key].instruction));
                }
            });

            if (!isComplete && travelWarning[message.text]) {
                isComplete = true;
                payloadMessage.push(
                    travelWarningPayload(message.text, travelWarning[message.text].severity_level, travelWarning[message.text].instruction),
                    );
            }

            if (isComplete) {
                lineWebhook.lineClient.replyMessage(replyToken, payloadMessage);
            } else {
                lineWebhook.replyText(replyToken, 'Hi~');
            }
        }
    });

    lineWebhook.lineWebhook(req, res);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('🚀 Server ready at http://localhost:8080');
});
