import * as moment from 'moment-timezone';
import { FlexMessage } from '@line/bot-sdk/dist/types';

export const taiwanTodayPayload = (
    country: string,
    confirmedCases: number,
    deaths: number,
): FlexMessage => ({
    type: 'flex',
    altText: `${country} 疫情消息`,
    contents: {
        type: 'bubble',
        hero: {
            type: 'image',
            url: 'https://storage.googleapis.com/aiii-bot-platform-tw/open-bot/OOber_%E5%8F%B0%E7%81%A3%E7%96%AB%E6%83%85.jpg',
            size: 'full',
            aspectRatio: '3:1',
            aspectMode: 'cover',
            action: {
                type: 'uri',
                label: 'Action',
                uri: 'https://www.cdc.gov.tw/',
            },
        },
        body: {
            type: 'box',
            layout: 'vertical',
            spacing: 'md',
            action: {
                type: 'uri',
                label: 'Action',
                uri: 'https://www.cdc.gov.tw/',
            },
            contents: [
                {
                    type: 'text',
                    text: `今日 ${country} 的疫情`,
                    size: 'xl',
                    align: 'center',
                    weight: 'bold',
                },
                {
                    type: 'separator',
                },
                {
                    type: 'text',
                    text: `確診案例：${confirmedCases} `,
                    align: 'start',
                    weight: 'bold',
                    color: '#0195BB',
                },
                {
                    type: 'text',
                    text: `死亡案例：${deaths}`,
                    align: 'start',
                    weight: 'bold',
                    color: '#0195BB',
                },
                {
                    type: 'text',
                    text: `截至 ${moment.tz('Asia/Taipei').format('YYYY.MM.DD HH:00')}`,
                    align: 'end',
                    color: '#535353',
                },
            ],
        },
        footer: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'button',
                    action: {
                        type: 'uri',
                        label: '再看看更多疫情消息',
                        uri: 'https://www.cdc.gov.tw/',
                    },
                    color: '#0195BB',
                },
            ],
        },
    },
});
