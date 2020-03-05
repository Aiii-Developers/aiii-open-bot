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
        if (!travelWarning) {
            travelWarning = await requestPromise.get('https://us-central1-aiii-bot-platform.cloudfunctions.net/travelWarning', {
                headers:
                {
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
        } else {
            lineWebhook.replyText(replyToken, JSON.stringify(travelWarning));
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

        console.log('coronavirusCaseNum=>', coronavirusCaseNum);
        lineWebhook.replyText(replyToken, `通報：${coronavirusCaseNum['Confirmed cases']}
死亡：${coronavirusCaseNum.Deaths}`);
    });

    lineWebhook.lineWebhook(req, res);
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log('🚀 Server ready at http://localhost:8080');
});
