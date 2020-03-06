import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as requestPromise from 'request-promise';
import { TextEventMessage } from '@line/bot-sdk';
import coldStart from './functions/cold-start';
import LineWebhook from './methods/webhook/line-webhook.class';


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
}

router.all('/webhook', (req: express.Request, res: express.Response) => {
    console.log('webhook start');
    if (!lineWebhook) {
        lineWebhook = new LineWebhook({
            channelAccessToken: 'YhcQSZ3rdDwgVClpHgD3xAlWWp7WvbrCY56vEvdabElyA5t+UNSHWQ3kDkRUzpmPv14Uay/LkeWvq+xwNPPGgGO/XuOxVCkDrF2A6KkCpOwgTiZglNc8v+eFqn20CrqmLeUgVuxr1+I2lFmrORIoRAdB04t89/1O/w1cDnyilFU=',
            channelSecret: 'b5bcc5e8d50e3ac5c75c2afa4330bdfb',
        });
    }

    lineWebhook.setHandleText(/^#/, async (event) => {
        const message = event.message as TextEventMessage;
        const { replyToken } = event;

        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            if (!travelWarning) {
                await initTravelWarning();
            }

            console.log('travelWarning=>', travelWarning);
            const messageHashTag = message.text.replace(/#/, '');
            if (travelWarning[messageHashTag]) {
                lineWebhook.replyText(replyToken, [
                    messageHashTag,
                    travelWarning[messageHashTag].instruction || '-',
                    travelWarning[messageHashTag].severity_level || '-',
                ]);
            } else {
                lineWebhook.replyText(replyToken, JSON.stringify(travelWarning));
            }
        }
    });

    lineWebhook.setHandleText(/台灣/, async (event) => {
        // const message = event.message as TextEventMessage;
        const { replyToken } = event;
        if (!coronavirusCaseNum) {
            coronavirusCaseNum = await requestPromise.get('https://us-central1-aiii-bot-platform.cloudfunctions.net/coronavirusCaseNum', {
                headers:
                {
                    'cache-control': 'no-cache',
                    'Content-Type': 'application/json',
                },
                json: true,
            });
        }
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            console.log('coronavirusCaseNum=>', coronavirusCaseNum);
            lineWebhook.replyText(replyToken, `通報：${coronavirusCaseNum['Confirmed cases']}
死亡：${coronavirusCaseNum.Deaths}`);
        }
    });


    lineWebhook.setHandleText(/中國大陸|中國|大陸|武漢|北京|上海|湖北|湖南|廣州|CHINA|china|China/, async (event) => {
        const { replyToken } = event;
        if (!travelWarning) {
            await initTravelWarning();
        }
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            lineWebhook.replyText(replyToken, [
                '中國大陸',
                travelWarning['中國大陸'].instruction || '-',
                travelWarning['中國大陸'].severity_level || '-',
            ]);
        }
    });

    lineWebhook.setHandleText(/伊朗|IRAN|iran|Iran/, async (event) => {
        const { replyToken } = event;
        if (!travelWarning) {
            await initTravelWarning();
        }
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            lineWebhook.replyText(replyToken, [
                '伊朗',
                travelWarning['伊朗'].instruction || '-',
                travelWarning['伊朗'].severity_level || '-',
            ]);
        }
    });

    lineWebhook.setHandleText(/新加坡|星國|獅城|singapore|SINGAPORE|Singapore/, async (event) => {
        const { replyToken } = event;
        if (!travelWarning) {
            await initTravelWarning();
        }
        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            lineWebhook.replyText(replyToken, [
                '新加坡',
                travelWarning['新加坡'].instruction || '-',
                travelWarning['新加坡'].severity_level || '-',
            ]);
        }
    });

    lineWebhook.setHandleText(/日本|japan|Japan|JAPAN/, async (event) => {
        const { replyToken } = event;
        if (!travelWarning) {
            await initTravelWarning();
        }

        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            lineWebhook.replyText(replyToken, [
                '日本',
                travelWarning['日本'].instruction || '-',
                travelWarning['日本'].severity_level || '-',
            ]);
        }
    });

    lineWebhook.setHandleText(/泰國|thailand|THAILAND|Thailand/, async (event) => {
        const { replyToken } = event;
        if (!travelWarning) {
            await initTravelWarning();
        }

        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            lineWebhook.replyText(replyToken, [
                '泰國',
                travelWarning['泰國'].instruction || '-',
                travelWarning['泰國'].severity_level || '-',
            ]);
        }
    });


    lineWebhook.setHandleText(/義大利|italy|ITALY|Italy/, async (event) => {
        const { replyToken } = event;
        if (!travelWarning) {
            await initTravelWarning();
        }

        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            lineWebhook.replyText(replyToken, [
                '義大利',
                travelWarning['義大利'].instruction || '-',
                travelWarning['義大利'].severity_level || '-',
            ]);
        }
    });

    lineWebhook.setHandleText(/韓國|korea|KOREA|Korea|歐巴/, async (event) => {
        const { replyToken } = event;
        if (!travelWarning) {
            await initTravelWarning();
        }

        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            lineWebhook.replyText(replyToken, [
                '韓國',
                travelWarning['韓國'].instruction || '-',
                travelWarning['韓國'].severity_level || '-',
            ]);
        }
    });

    lineWebhook.setHandleText(/澳門特別行政區|澳門|macao|MACAO|Macao/, async (event) => {
        const { replyToken } = event;
        if (!travelWarning) {
            await initTravelWarning();
        }

        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            lineWebhook.replyText(replyToken, [
                '澳門特別行政區',
                travelWarning['澳門特別行政區'].instruction || '-',
                travelWarning['澳門特別行政區'].severity_level || '-',
            ]);
        }
    });

    lineWebhook.setHandleText(/香港特別行政區|香港|hong kong|HANG KONH|Hong Kong|HongKong|HK/, async (event) => {
        const { replyToken } = event;
        if (!travelWarning) {
            await initTravelWarning();
        }

        if (disableMap[lineWebhook.roomId || lineWebhook.groupId || lineWebhook.userId] !== false) {
            lineWebhook.replyText(replyToken, [
                '香港特別行政區',
                travelWarning['香港特別行政區'].instruction || '-',
                travelWarning['香港特別行政區'].severity_level || '-',
            ]);
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

    lineWebhook.setHandleText(/.*/, async (event) => { });

    lineWebhook.lineWebhook(req, res);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('🚀 Server ready at http://localhost:8080');
});
