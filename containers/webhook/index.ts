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
import { travelWarningInfo } from './template/travelWarningInfo';
import { travelWarningPayload } from './template/travelWarningPayload';
import { travelWarningNone } from './template/travelWarningNone';

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


    lineWebhook.setHandleText(/台灣|臺灣|taiwan|武漢|肺炎|疫情|疾病|新冠肺炎快訊/i, async (event) => {
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

    lineWebhook.setHandleText(/出國|旅遊|警示等級|了解各國疫情/, async (event) => {
        const { replyToken } = event;
        lineWebhook.lineClient.replyMessage(replyToken, travelWarningInfo);
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

    lineWebhook.setHandleText(/^#/, async (event) => {
        const { replyToken } = event;
        const message = event.message as TextEventMessage;
        let text = message.text.replace(/#/, '').toLocaleLowerCase();
        if (!travelWarning) {
            await initTravelWarning();
        }

        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            const payloadMessage: any = [];
            _.forEach(keyboardMap, (regExp, key) => {
                if (regExp.test(text)) {
                    text = key;
                }
            });

            if (travelWarning[text]) {
                payloadMessage.push(
                    travelWarningPayload(text, travelWarning[text].severity_level, travelWarning[text].instruction),
                );
                lineWebhook.lineClient.replyMessage(replyToken, payloadMessage);
            } else {
                lineWebhook.lineClient.replyMessage(replyToken, travelWarningNone(text));
            }
        }
    });

    lineWebhook.setHandleText(/.*/, async (event) => {
        const { replyToken } = event;
        const message = event.message as TextEventMessage;
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            if (!coronavirusCaseNum) {
                await initCoronavirusCaseNum();
            }

            const key = message.text;

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

    lineWebhook.lineWebhook(req, res);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('🚀 Server ready at http://localhost:8080');
});
