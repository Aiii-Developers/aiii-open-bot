"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.travelWarningNone = (country) => ({
    type: 'flex',
    altText: '旅遊警示',
    contents: {
        type: 'bubble',
        hero: {
            type: 'image',
            url: 'https://storage.googleapis.com/aiii-bot-platform-tw/open-bot/OOber_%E6%9C%AA%E6%9C%89%E7%B4%9A%E5%88%A5.jpg',
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
                    text: `<${country}>`,
                    align: 'center',
                    weight: 'bold',
                },
                {
                    type: 'text',
                    text: '此國家尚未有旅遊警示等級唷！',
                    size: 'md',
                    align: 'center',
                    weight: 'bold',
                    color: '#29BD0A',
                    wrap: true,
                },
            ],
        },
    },
});
//# sourceMappingURL=travelWarningNone.js.map