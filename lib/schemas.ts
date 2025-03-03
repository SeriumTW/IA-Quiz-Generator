import { z } from 'zod';

export const questionSchema = z.object({
  question: z.string(),
  options: z
    .array(z.string())
    .length(4)
    .describe(
      'Four possible answers to the question. Only one should be correct. They should all be of equal lengths.'
    ),
  answer: z
    .enum(['A', 'B', 'C', 'D'])
    .describe(
      'The correct answer, where A is the first option, B is the second, and so on.'
    ),
});

export type Question = z.infer<typeof questionSchema>;

// Accetta un array di domande di qualsiasi lunghezza (ma almeno 1)
export const questionsSchema = z.array(questionSchema).min(1);
