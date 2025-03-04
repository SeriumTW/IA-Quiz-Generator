import { questionSchema, questionsSchema } from '@/lib/schemas';
import { google } from '@ai-sdk/google';
import { streamObject } from 'ai';

export const maxDuration = 60;

export async function POST(req: Request) {
  const { files } = await req.json();
  const firstFile = files[0].data;

  process.env.GOOGLE_GENERATIVE_AI_API_KEY =
    'AIzaSyBA20yOLMLz5hejoVaKWXGfbIXUfQd_dGc';

  // Istruzioni rafforzate per garantire una distribuzione uniforme e maggiore variabilità
  const systemPrompt =
    'Sei un insegnante esperto. Il tuo compito è analizzare un documento e creare ESATTAMENTE 30 domande a scelta multipla basate STRETTAMENTE sul contenuto del documento. ' +
    'Tutte le domande e le risposte devono essere in italiano. È FONDAMENTALE che tu crei esattamente 30 domande, né più né meno. ' +
    'Ogni domanda deve avere 4 opzioni di risposta etichettate come A, B, C, D, con una sola risposta corretta. Le opzioni devono avere lunghezza simile. ' +
    'Non includere spiegazioni o contenuti extra oltre alle 30 domande richieste. ' +
    '\n\nPROCESSO OBBLIGATORIO DA SEGUIRE:' +
    "\n1. LEGGI PRIMA tutto il documento dall'inizio alla fine, senza creare ancora domande." +
    '\n2. DIVIDI mentalmente il documento in 5 sezioni di uguale lunghezza: inizio, primo-centro, centro, secondo-centro e fine.' +
    "\n3. SELEZIONA ESATTAMENTE 6 concetti da CIASCUNA delle 5 sezioni, concentrandoti su informazioni specifiche e distanti tra loro all'interno di ogni sezione." +
    '\n4. MESCOLA accuratamente questi concetti e crea le domande in ordine completamente casuale, non sequenziale.' +
    '\n5. ASSICURATI che le domande coprano temi e concetti DIVERSI tra loro, evitando di chiedere la stessa informazione in modi diversi.' +
    "\n6. VERIFICA di aver coperto l'intero documento in modo uniforme, senza favorire nessuna sezione." +
    '\n7. IMPORTANTE: Ogni domanda deve essere basata ESCLUSIVAMENTE su informazioni contenute nel documento, senza aggiungere difficoltà o richiedere conoscenze esterne.' +
    '\n\nQuesta distribuzione uniforme con maggiore variabilità è CRUCIALE e NON NEGOZIABILE.';

  const userPrompt =
    'Crea ESATTAMENTE 30 domande a scelta multipla basate STRETTAMENTE su questo documento. ' +
    'Tutte le domande e le risposte devono essere in italiano. Devi fornire esattamente 30 domande complete con 4 opzioni ciascuna, etichettate A, B, C, D. ' +
    '\n\nPROCEDURA OBBLIGATORIA:' +
    "\n1. Prima di tutto, leggi COMPLETAMENTE il documento dall'inizio alla fine." +
    '\n2. Dividi il documento in 5 sezioni di uguale lunghezza (non solo inizio, metà e fine, ma 5 sezioni distinte).' +
    '\n3. Seleziona 6 domande da CIASCUNA sezione, concentrandoti su informazioni distanti tra loro dentro ogni sezione.' +
    "\n4. MESCOLA COMPLETAMENTE l'ordine delle domande in modo che non seguano l'ordine del documento." +
    '\n5. VARIA il tipo di domande, ma assicurati che tutte siano basate su informazioni presenti nel documento.' +
    '\n\nATTENZIONE: Due problemi principali da evitare:' +
    '\n1. NON concentrarti solo su alcune parti del documento. Devi distribuire UNIFORMEMENTE le domande su TUTTO il documento.' +
    '\n2. NON generare domande simili o che chiedono la stessa informazione in modi diversi. Ogni domanda deve essere UNICA e coprire un concetto diverso.' +
    '\n3. NON creare domande che richiedono conoscenze esterne al documento.';

  // Generazione di un seed casuale più forte per garantire diversità tra quiz
  const timestamp = Date.now().toString();
  const randomNum = Math.floor(Math.random() * 1000000).toString();
  const randomBytes = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const randomSeed = timestamp + '-' + randomNum + '-' + randomBytes;

  // Aggiunta di temperatura alta per aumentare la diversità nelle risposte
  const result = streamObject({
    model: google('gemini-1.5-pro-latest'),
    temperature: 0.8, // Temperatura alta per aumentare casualità
    messages: [
      {
        role: 'system',
        content:
          systemPrompt +
          `\n\nUtilizza questo seed casuale come base per la randomizzazione: ${randomSeed}. PROBLEMA CRITICO DA RISOLVERE: le generazioni precedenti producevano quiz quasi identici. DEVI ASSOLUTAMENTE creare domande COMPLETAMENTE DIVERSE e in un ORDINE TOTALMENTE DIVERSO rispetto a qualsiasi generazione precedente. Questo è il requisito più importante in assoluto.

REGOLE AGGIUNTIVE OBBLIGATORIE:
1. Cambia RADICALMENTE l'ordine delle 30 domande rispetto a qualsiasi generazione precedente
2. Seleziona concetti e dettagli DIFFERENTI per formulare domande su ciascuna delle 5 sezioni
3. Riformula COMPLETAMENTE il modo in cui le domande vengono poste
4. Varia gli argomenti specifici selezionati dalle varie parti del documento
5. Assicurati che le prime 10 domande siano diverse rispetto a qualsiasi generazione precedente
6. Ogni nuova generazione deve sentirsi come un quiz completamente nuovo`,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text:
              userPrompt +
              `\n\nISTRUZIONI CRITICHE PER LA DIVERSIFICAZIONE: Usa questo seed per garantire massima variabilità: ${randomSeed}.

PROBLEMA DA RISOLVERE: Le generazioni precedenti creavano quiz troppo simili con le stesse domande nelle stesse posizioni.

ISTRUZIONI FONDAMENTALI:
1. EVITA di iniziare con le stesse 5-10 domande delle generazioni precedenti
2. RISTRUTTURA COMPLETAMENTE l'ordine delle domande in modo radicalmente diverso
3. VARIA gli argomenti specifici selezionati (anche se dal solito documento)
4. RIFORMULA le domande in modi completamente diversi
5. SPOSTA domande che prima erano all'inizio verso la fine, e viceversa
6. CERCA informazioni in diverse parti del documento rispetto alle generazioni precedenti
7. ATTENZIONE alle prime 10 domande: assicurati che siano completamente diverse

RICORDA: Ognuno che usa questa applicazione dovrebbe ricevere un quiz che sembra completamente nuovo, anche se basato sullo stesso documento.`,
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
