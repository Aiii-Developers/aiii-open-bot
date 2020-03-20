"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const path = __importStar(require("path"));
exports.workerPromise = (jsPath, data) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const worker = new worker_threads_1.Worker(path.resolve(jsPath), { workerData: data });
        worker.on('message', (message) => {
            console.log('main thread get message', message);
            resolve(message);
        });
        worker.on('error', (error) => {
            console.error(error);
            reject(error);
        });
    });
});
//# sourceMappingURL=workerPromise.js.map