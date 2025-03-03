'use server';

import dotenv from 'dotenv';
import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

dotenv.config();

export const generateQuizTitle = async (file: string) => {
  try {
    const result = await generateObject({
      model: google('gemini-1.5-flash-latest'),
      schema: z.object({
        title: z
          .string()
          .describe(
            'A max three word title for the quiz based on the file provided as context'
          ),
      }),
      prompt:
        "Genera un titolo in italiano per un quiz basato sul seguente nome di file (PDF). Cerca di estrarre più informazioni possibili dal nome del file. Se il nome del file è solo numeri o incoerente, restituisci semplicemente 'Quiz'.\n\n " +
        file,
    });

    return result.object.title;
  } catch (error) {
    return 'Quiz';
  }
};
