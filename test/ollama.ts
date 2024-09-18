import { ollama } from 'ollama-ai-provider';
import { streamText } from 'ai';

const { textStream } = await streamText({
  model: ollama('qwen:32b'),
  prompt: '你好.',
});

for await (const textPart of textStream) {
  console.log(textPart);
}

