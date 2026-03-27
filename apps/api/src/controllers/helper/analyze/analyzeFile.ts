import { AiAnalysis, AiAnalysisError } from '@monorepo/types'
import type { EasyInputMessage } from 'openai/resources/responses/responses.mjs'
import proPrompt from '../../../prompt/pro_prompt.json'
import basePrompt from '../../../prompt/prompt.json'
import { openAiClient } from '../../../server'
import { parseOpenAiApiResponse } from './parseOpenAiApiResponse'

const PROMPT_VAR = '{{CV_TEXT}}'

const wrapCvText = (text: string): string => {
  const sanitized = text
    .replace(/<cv_content>/gi, '[cv_content]')
    .replace(/<\/cv_content>/gi, '[/cv_content]')
  return `<cv_content>\n${sanitized}\n</cv_content>`
}

export type AnalyseApiResponse = { id: string; output_text: string }

type AnalyzeOptions = { premium?: boolean; signal?: AbortSignal }

export const analyzeFile = async (
  extractedText: string,
  options?: AnalyzeOptions
): Promise<AiAnalysis | AiAnalysisError> => {
  let response: AnalyseApiResponse

  const isPremium = options?.premium ?? false
  const prompt = isPremium ? proPrompt : basePrompt

  try {
    response = await openAiClient.responses
      .create(
        {
          model: isPremium ? 'o3' : 'gpt-4.1-nano',
          input: [
            { role: 'developer', content: getPrompt('developer', prompt) },
            {
              role: 'assistant',
              content: getPrompt('assistant', prompt).replace(
                PROMPT_VAR,
                wrapCvText(extractedText)
              )
            },
            { role: 'user', content: wrapCvText(extractedText) }
          ]
        },
        { signal: options?.signal }
      )
      .then((res) => {
        return { id: res.id, output_text: res.output_text }
      })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw error
    }
    return { error: `OpenAI API Error: ${error || 'Unknown error'}` }
  }

  return parseOpenAiApiResponse(response)
}

const getPrompt = (
  role: EasyInputMessage['role'],
  promptConfig: typeof proPrompt | typeof basePrompt
) => {
  switch (role) {
    case 'developer':
      return JSON.stringify(promptConfig.developer_prompt)
    case 'assistant':
      return JSON.stringify(promptConfig.assistant_prompt)
    default:
      throw new Error(`Role not supported: ${role}`)
  }
}

export type { AiAnalysis, AiAnalysisError }
