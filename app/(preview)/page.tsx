'use client';

import { useState } from 'react';
import { experimental_useObject } from 'ai/react';
import { questionsSchema } from '@/lib/schemas';
import { z } from 'zod';
import { toast } from 'sonner';
import { FileUp, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Quiz from '@/components/quiz';
import { Link } from '@/components/ui/link';
import NextLink from 'next/link';
import { generateQuizTitle } from './actions';
import { AnimatePresence, motion } from 'framer-motion';
import { VercelIcon, GitIcon } from '@/components/icons';

export default function ChatWithFiles() {
  const [files, setFiles] = useState<File[]>([]);
  const [questions, setQuestions] = useState<z.infer<typeof questionsSchema>>(
    []
  );
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState<string>();

  const {
    submit,
    object: partialQuestions,
    isLoading,
  } = experimental_useObject({
    api: '/api/generate-quiz',
    schema: questionsSchema,
    initialValue: undefined,
    onError: (error) => {
      toast.error('Impossibile generare il quiz. Riprova più tardi.');
      setFiles([]);
    },
    onFinish: ({ object }) => {
      setQuestions(object ?? []);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isSafari && isDragging) {
      toast.error(
        'Safari non supporta il drag & drop. Si prega di utilizzare il selettore di file.'
      );
      return;
    }

    const selectedFiles = Array.from(e.target.files || []);
    const validFiles = selectedFiles.filter(
      (file) => file.type === 'application/pdf' && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== selectedFiles.length) {
      toast.error(
        'Sono consentiti solo file PDF di dimensioni inferiori a 5MB.'
      );
    }

    setFiles(validFiles);
  };

  const encodeFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitWithFiles = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const encodedFiles = await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          type: file.type,
          data: await encodeFileAsBase64(file),
        }))
      );

      // Prima invia il file per generare le domande
      submit({ files: encodedFiles });

      // Poi genera il titolo
      try {
        const generatedTitle = await generateQuizTitle(encodedFiles[0].name);
        setTitle(generatedTitle);
      } catch (error) {
        setTitle('Quiz');
      }
    } catch (error) {
      toast.error('Si è verificato un errore. Riprova più tardi.');
    }
  };

  const clearPDF = () => {
    setFiles([]);
    setQuestions([]);
  };
  
  const regenerateQuiz = async () => {
    if (files.length === 0) return;
    
    // Mostra un toast per informare l'utente
    toast.info('Generazione di un nuovo quiz con domande diverse in corso...');
    
    try {
      // Aggiungiamo un timestamp per forzare una nuova generazione
      const encodedFiles = await Promise.all(
        files.map(async (file) => ({
          name: file.name + '?t=' + Date.now(), // Aggiunge timestamp al nome del file
          type: file.type,
          data: await encodeFileAsBase64(file),
        }))
      );
      
      // Resetta le domande esistenti prima di inviare
      setQuestions([]);
      
      // Invia per generare nuove domande
      submit({ files: encodedFiles });
    } catch (error) {
      toast.error('Si è verificato un errore. Riprova più tardi.');
    }
  };

  const progress = partialQuestions ? (partialQuestions.length / 30) * 100 : 0;

  // Mostra il quiz se ci sono domande
  if (questions.length > 0) {
    return (
      <Quiz 
        title={title ?? 'Quiz'} 
        questions={questions} 
        clearPDF={clearPDF}
        regenerateQuiz={regenerateQuiz}
      />
    );
  }

  return (
    <div
      className='min-h-[100dvh] w-full flex justify-center bg-gradient-to-b from-blue-50 to-white dark:from-blue-950 dark:to-gray-900'
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragExit={() => setIsDragging(false)}
      onDragEnd={() => setIsDragging(false)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange({
          target: { files: e.dataTransfer.files },
        } as React.ChangeEvent<HTMLInputElement>);
      }}
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            className='fixed pointer-events-none dark:bg-zinc-900/90 h-dvh w-dvw z-10 justify-center items-center flex flex-col gap-1 bg-zinc-100/90'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div>Trascina qui i file</div>
            <div className='text-sm dark:text-zinc-400 text-zinc-500'>
              {'(Solo PDF)'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Card className='w-full max-w-md h-full border-0 sm:border sm:h-fit mt-12 shadow-lg bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800'>
        <CardHeader className='text-center space-y-6'>
          <div className='mx-auto flex items-center justify-center space-x-2 text-muted-foreground'>
            <div className='rounded-full bg-blue-100 p-3 dark:bg-blue-900'>
              <FileUp className='h-6 w-6 text-blue-600 dark:text-blue-300' />
            </div>
          </div>
          <div className='space-y-2'>
            <CardTitle className='text-2xl font-bold text-blue-700 dark:text-blue-400'>
              Generatore di Quiz Didattici
            </CardTitle>
            <CardDescription className='text-base'>
              Carica un PDF per generare un quiz interattivo basato sul suo
              contenuto. Ideale per esercitazioni e verifiche scolastiche.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitWithFiles} className='space-y-4'>
            <div
              className={`relative flex flex-col items-center justify-center border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6 transition-colors hover:border-blue-500 bg-blue-50 dark:bg-blue-950/50`}
            >
              <input
                type='file'
                onChange={handleFileChange}
                accept='application/pdf'
                className='absolute inset-0 opacity-0 cursor-pointer'
              />
              <FileUp className='h-8 w-8 mb-2 text-blue-600 dark:text-blue-400' />
              <p className='text-sm text-muted-foreground text-center'>
                {files.length > 0 ? (
                  <span className='font-medium text-foreground'>
                    {files[0].name}
                  </span>
                ) : (
                  <span>Trascina qui il tuo PDF o clicca per sfogliare.</span>
                )}
              </p>
            </div>
            <Button
              type='submit'
              className='w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600'
              disabled={files.length === 0}
            >
              {isLoading ? (
                <span className='flex items-center space-x-2'>
                  <Loader2 className='h-4 w-4 animate-spin' />
                  <span>Generazione Quiz in corso...</span>
                </span>
              ) : (
                'Genera Quiz'
              )}
            </Button>
          </form>
        </CardContent>
        {isLoading && (
          <CardFooter className='flex flex-col space-y-4'>
            <div className='w-full space-y-1'>
              <div className='flex justify-between text-sm text-muted-foreground'>
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className='h-2' />
            </div>
            <div className='w-full space-y-2'>
              <div className='grid grid-cols-6 sm:grid-cols-6 items-center justify-center space-x-2 text-sm'>
                <div
                  className={`h-2 w-2 rounded-full ${
                    isLoading ? 'bg-yellow-500/50 animate-pulse' : 'bg-muted'
                  }`}
                />
                <span className='text-muted-foreground text-center col-span-full'>
                  {partialQuestions
                    ? `Generazione domanda ${partialQuestions.length + 1} di 30`
                    : 'Analisi del contenuto PDF'}
                </span>
              </div>
            </div>
          </CardFooter>
        )}
      </Card>
      <motion.div
        className='flex flex-row gap-4 items-center justify-center fixed bottom-6 text-xs '
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className='text-center text-sm text-blue-600 dark:text-blue-400'>
          © 2025 - Strumento Didattico per la Creazione di Quiz
        </div>
      </motion.div>
    </div>
  );
}
