import { questionSchema, questionsSchema } from '@/lib/schemas';
import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files } = await req.json();
  const firstFile = files[0].data;

  const result = streamObject({
    model: google('gemini-1.5-pro-latest'),
    messages: [
      {
        role: 'system',
        content:
          'Sei un insegnante esperto. Il tuo compito è analizzare un documento e creare ESATTAMENTE 30 domande a scelta multipla basate sul contenuto del documento. Tutte le domande e le risposte devono essere in italiano. È FONDAMENTALE che tu crei esattamente 30 domande, né più né meno. Ogni domanda deve avere 4 opzioni di risposta etichettate come A, B, C, D, con una sola risposta corretta. Le opzioni devono avere lunghezza simile. Non includere spiegazioni o contenuti extra oltre alle 30 domande richieste.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Crea ESATTAMENTE 30 domande a scelta multipla basate su questo documento. Tutte le domande e le risposte devono essere in italiano. Devi fornire esattamente 30 domande complete con 4 opzioni ciascuna, etichettate A, B, C, D.',
          },
          {
            type: 'file',
            data: firstFile,
            mimeType: 'application/pdf',
          },
        ],
      },
    ],
    schema: questionSchema,
    output: 'array',
    onFinish: ({ object }) => {
      const res = questionsSchema.safeParse(object);
      if (res.error) {
        throw new Error(res.error.errors.map((e) => e.message).join('\n'));
      }
    },
  });

  return result.toTextStreamResponse();
}
