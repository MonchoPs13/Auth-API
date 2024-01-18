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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
process.on('uncaughtException', err => {
    console.log(`UNCAUGHT EXCEPTION: ${err}`);
    process.exit(1);
});
function connectToDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = process.env.DB_USER;
            const password = process.env.DB_PASSWORD;
            yield mongoose_1.default.connect(process.env.DB_CONNECT.replace('<user>', user).replace('<password>', password));
            console.log('Connection to database successfull');
        }
        catch (err) {
            console.log(`Unable to connect to database: ${err}`);
            server.close(() => process.exit(1));
        }
    });
}
const server = app_1.default.listen(process.env.PORT, () => {
    console.log(`Server started on ${process.env.HOST_ROUTE}`);
});
process.on('unhandledRejection', err => {
    console.log(`UNHANDLED REJECTION: ${err}`);
    server.close(() => process.exit(1));
});
connectToDatabase();
