import { Worker } from 'worker_threads';
import * as path from 'path';

export const workerPromise = async (jsPath: string, data: any) => new Promise((resolve, reject) => {
        const worker = new Worker(path.resolve(jsPath), { workerData: data });

        worker.on('message', (message) => {
            console.log('main thread get message', message);
            resolve(message);
        });

        worker.on('error', (error) => {
            console.error(error);
            reject(error);
        });
    });
