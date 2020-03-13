
export const travelWarningPayload = (
    country: string,
    severityLevel: number,
    instruction: string,
): any => ({
    type: 'flex',
    altText: 'Flex Message',
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: 'https://storage.googleapis.com/aiii-bot-platform-tw/open-bot/OOber_%E7%AC%AC%E4%B8%80%E7%B4%9A%E5%88%A5.jpg',
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
            text: `${severityLevel} `,
            size: 'lg',
            align: 'center',
            weight: 'bold',
            color: '#063293',
          },
          {
            type: 'text',
            text: `${instruction} `,
            align: 'center',
          },
          {
            type: 'separator',
          },
        ],
      },
    },
  });
