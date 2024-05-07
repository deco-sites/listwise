import {
  type ChatCompletionCreateParamsNonStreaming,
  type ChatCompletionMessageParam,
  type Completions,
} from "../resources/chat/completions.ts";
import {
  type BaseFunctionsArgs,
  type RunnableFunctions,
  RunnableTools,
} from "./RunnableFunction.ts";
import {
  AbstractChatCompletionRunner,
  AbstractChatCompletionRunnerEvents,
  RunnerOptions,
} from "./AbstractChatCompletionRunner.ts";
import { isAssistantMessage } from "./chatCompletionUtils.ts";

export interface ChatCompletionRunnerEvents
  extends AbstractChatCompletionRunnerEvents {
  content: (content: string) => void;
}

export type ChatCompletionFunctionRunnerParams<
  FunctionsArgs extends BaseFunctionsArgs,
> =
  & Omit<
    ChatCompletionCreateParamsNonStreaming,
    "functions"
  >
  & {
    functions: RunnableFunctions<FunctionsArgs>;
  };

export type ChatCompletionToolRunnerParams<
  FunctionsArgs extends BaseFunctionsArgs,
> =
  & Omit<
    ChatCompletionCreateParamsNonStreaming,
    "tools"
  >
  & {
    tools: RunnableTools<FunctionsArgs>;
  };

export class ChatCompletionRunner
  extends AbstractChatCompletionRunner<ChatCompletionRunnerEvents> {
  static runFunctions(
    completions: Completions,
    params: ChatCompletionFunctionRunnerParams<any[]>,
    options?: RunnerOptions,
  ): ChatCompletionRunner {
    const runner = new ChatCompletionRunner();
    runner._run(() => runner._runFunctions(completions, params, options));
    return runner;
  }

  static runTools(
    completions: Completions,
    params: ChatCompletionToolRunnerParams<any[]>,
    options?: RunnerOptions,
  ): ChatCompletionRunner {
    const runner = new ChatCompletionRunner();
    runner._run(() => runner._runTools(completions, params, options));
    return runner;
  }

  override _addMessage(message: ChatCompletionMessageParam) {
    super._addMessage(message);
    if (isAssistantMessage(message) && message.content) {
      this._emit("content", message.content as string);
    }
  }
}
