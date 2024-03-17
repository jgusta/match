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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = require("@std/assert");
var select_ts_1 = require("../select.ts");
Deno.test("should resolve with the correct action in post mode", function () { return __awaiter(void 0, void 0, void 0, function () {
    var matchSeqObject, pred1, action1, pred2, action2, matcher, result1, result2, result3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                matchSeqObject = (0, select_ts_1.default)();
                pred1 = function () { return 1; };
                action1 = function () { return "Case 1"; };
                pred2 = function () { return 2; };
                action2 = function () { return "Case 2"; };
                matcher = matchSeqObject.on(pred1, action1).on(pred2, action2)
                    .otherwise(function () { return "No match"; });
                return [4 /*yield*/, matcher.match(1)];
            case 1:
                result1 = _a.sent();
                return [4 /*yield*/, matcher.match(2)];
            case 2:
                result2 = _a.sent();
                return [4 /*yield*/, matcher.match(3)];
            case 3:
                result3 = _a.sent();
                // Assert that the correct action is resolved
                (0, assert_1.assertEquals)(result1, "Case 1");
                (0, assert_1.assertEquals)(result2, "Case 2");
                (0, assert_1.assertEquals)(result3, "No match");
                return [2 /*return*/];
        }
    });
}); });
Deno.test("should match in post mode where switch is passed to case and the result is a boolean", function () { return __awaiter(void 0, void 0, void 0, function () {
    var matchSeqObject, pred1, action1, pred2, action2, matcher, result1, result2, result3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                matchSeqObject = (0, select_ts_1.default)();
                pred1 = function (x) { return x === 1; };
                action1 = function () { return "Case 1"; };
                pred2 = function (x) { return x === 3; };
                action2 = function () { return "Case 2"; };
                matcher = matchSeqObject.on(pred1, action1).on(pred2, action2)
                    .otherwise(function () { return "No match"; });
                return [4 /*yield*/, matcher.match(1)];
            case 1:
                result1 = _a.sent();
                return [4 /*yield*/, matcher.match(2)];
            case 2:
                result2 = _a.sent();
                return [4 /*yield*/, matcher.match(3)];
            case 3:
                result3 = _a.sent();
                // Assert that the correct action is resolved
                (0, assert_1.assertEquals)(result1, "Case 1");
                (0, assert_1.assertEquals)(result2, "No match");
                (0, assert_1.assertEquals)(result3, "Case 2");
                return [2 /*return*/];
        }
    });
}); });
