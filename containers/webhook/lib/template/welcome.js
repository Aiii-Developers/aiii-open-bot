"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcome = {
    type: 'flex',
    altText: '嗨！我是OOber疫',
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
                    text: '「武漢」、「肺炎」、「疾病」、「新冠肺炎快訊」等字詞',
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
                    text: '「出國」、「旅遊」、「警示等級」、「了解各國疫情」等字詞',
                    margin: 'lg',
                    weight: 'bold',
                    color: '#FF5D5D',
                    wrap: true,
                },
            ],
        },
    },
};
//# sourceMappingURL=welcome.js.map