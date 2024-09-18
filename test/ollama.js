"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ollama_ai_provider_1 = require("ollama-ai-provider");
var ai_1 = require("ai");
var text = (await (0, ai_1.generateText)({
    model: (0, ollama_ai_provider_1.ollama)('llama3.1'),
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
})).text;
console.log(text);
