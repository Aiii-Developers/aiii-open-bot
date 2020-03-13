import { Request, Response } from 'express';
import {
  Client, Message, FollowEvent, MessageEvent, UnfollowEvent,
  JoinEvent, LeaveEvent, PostbackEvent,
  WebhookEvent, BeaconEvent, TextEventMessage,
} from '@line/bot-sdk';
import _ from 'lodash';

interface LineConfig {
  channelAccessToken: string;
  channelSecret: string;
}


interface EventStack {
  eventName: string | RegExp;
  type: 'text' | 'postback';
  callback: Function;
}


export default class LineWebhook {
  public lineClient: Client;

  private eventStack: EventStack[] = [];

  public userId = '';

  public roomId = '';

  public groupId = '';

  constructor(lineConfig: LineConfig) {
    this.lineClient = new Client(lineConfig);
  }

  public async lineWebhook(req: Request, res: Response) {
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

    return Promise.all(_.map(req.body.events, this.handleEvent))
      .then(() => {
        res.end();
      })
      .catch((err) => {
        console.error(err);
        res.status(500).end();
      });
  }

  /**
 * 設定 text 事件
 * @param eventName 觸發文字(string 或 正規表達式)
 * @param callback 自訂的函式
 */
  public setHandleText(eventName: string | RegExp, callback: (event: MessageEvent) => void) {
    this.eventStack.push({
      eventName,
      type: 'text',
      callback,
    });
  }

  private handleEvent = async (event: WebhookEvent) => {
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
  };

  protected handleText = async (event: MessageEvent): Promise<any> => {
    console.log('text', JSON.stringify(event));

    const message = event.message as TextEventMessage;
    const { userId } = event.source;
    if (!userId) {
      throw Error('no userId');
    }

    for (const item of this.eventStack) {
      if (item.type === 'text' && (
        typeof item.eventName === 'string' ? item.eventName === message.text
          : item.eventName.test(message.text)
      )) {
        return item.callback(event);
      }
    }

    return this.replyText(event.replyToken, '收到');
  };

  protected handleImage = async (event: MessageEvent): Promise<any> => this.replyText(event.replyToken, '收到');

  protected handleVideo = async (event: MessageEvent): Promise<any> => this.replyText(event.replyToken, '收到');

  protected handleAudio = async (event: MessageEvent): Promise<any> => this.replyText(event.replyToken, '收到');

  protected handleFile = async (event: MessageEvent): Promise<any> => this.replyText(event.replyToken, '收到');

  protected handleLocation = async (event: MessageEvent): Promise<any> => this.replyText(event.replyToken, '收到');

  protected handleSticker = async (event: MessageEvent): Promise<any> => this.replyText(event.replyToken, '收到');


  protected handleFollow = async (event: FollowEvent) => this.lineClient.replyMessage(event.replyToken, {
    type: 'flex',
    altText: 'Flex Message',
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
            text: '「武漢」、「肺炎」、「疫情」、「疾病」等字詞',
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
            text: '「出國」、「旅遊」、「警示等級」等字詞',
            margin: 'lg',
            weight: 'bold',
            color: '#FF5D5D',
            wrap: true,
          },
        ],
      },
    },
  } as any);

  protected handleUnfollow = async (event: UnfollowEvent) => {
    console.log(`被封鎖： ${JSON.stringify(event)}`);
  };

  protected handleJoin = async (event: JoinEvent) => this.replyText(event.replyToken, `Joined ${event.source.type}`);

  protected handleLeave = async (event: LeaveEvent) => {
    console.log(`Left ${event.source.type}`);
    return null;
  };

  protected handlePostback = async (event: PostbackEvent) => {
    console.log(`postback: ${JSON.stringify(event)}`);
  };

  protected handleBeacon = async (event: BeaconEvent) => this.replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);

  /**
   * 回覆文字訊息
   * @param replyToken
   * @param texts
   */
  public replyText(replyToken: string, texts: string | string[]) {
    const textArray = _.isArray(texts) ? texts : [texts];
    const messages: Message[] = _.map(textArray, (text) => (<Message>{ type: 'text', text }));
    return this.lineClient.replyMessage(replyToken, messages);
  }
}
