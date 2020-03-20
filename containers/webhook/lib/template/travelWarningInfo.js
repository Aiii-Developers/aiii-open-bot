"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.travelWarningInfo = {
    type: 'flex',
    altText: '最近是不是要出國玩呢？',
    contents: {
        type: 'bubble',
        direction: 'ltr',
        hero: {
            type: 'image',
            url: 'https://storage.googleapis.com/aiii-bot-platform-tw/open-bot/OOber_%E7%AC%AC%E4%B8%80%E7%B4%9A%E5%88%A5.jpg',
            gravity: 'center',
            size: 'full',
            aspectRatio: '3:1',
            aspectMode: 'cover',
            backgroundColor: '#0195BB',
        },
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: '最近是不是要出國玩呢？快來看看要前往的國家有沒有傳染病危險吧！',
                    align: 'start',
                    gravity: 'center',
                    weight: 'bold',
                    color: '#535353',
                    wrap: true,
                },
                {
                    type: 'text',
                    text: '(輸入#國家，就可以查到囉！例如：#日本)',
                    margin: 'lg',
                    wrap: true,
                },
            ],
        },
    },
};
//# sourceMappingURL=travelWarningInfo.js.map