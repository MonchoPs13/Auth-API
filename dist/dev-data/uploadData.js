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
const node_path_1 = __importDefault(require("node:path"));
const node_fs_1 = __importDefault(require("node:fs"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: node_path_1.default.resolve(__dirname, '../config.env') });
const userModel_1 = __importDefault(require("../models/userModel"));
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD;
const DB = process.env.DB_CONNECT.replace('<user>', user).replace('<password>', password);
mongoose_1.default
    .connect(DB)
    .then(() => console.log('Connection to database successfull'));
function uploadData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = JSON.parse(node_fs_1.default.readFileSync(`${__dirname}/users.json`, 'utf-8'));
            yield userModel_1.default.create(users);
            console.log('Data uploaded successfully');
        }
        catch (err) {
            console.log(err);
        }
        finally {
            process.exit();
        }
    });
}
function deleteData() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield userModel_1.default.deleteMany();
            console.log('Data deleted successfully');
        }
        catch (err) {
            console.log(err);
        }
        finally {
            process.exit();
        }
    });
}
if (process.argv[2] === '--upload')
    uploadData();
else if (process.argv[2] === '--delete')
    deleteData();
