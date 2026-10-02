'use client';
import { useRouter } from 'next/navigation';
import { Controller, ErrorMessage, useForm, useWatch } from 'react-hook-form';
import type { CreatePromptDto } from '@/core/application/prompts/create-prompt.dto';
import { createPromptSchema } from '@/core/application/prompts/create-prompt.dto';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPromptAction } from '@/app/actions/prompt.actions';
import { toast } from 'sonner';
import { CopyButton } from '../button-actions';

export const PromptForm = () => {
    const router = useRouter();

    const form = useForm<CreatePromptDto>({
        resolver: zodResolver(createPromptSchema),
        defaultValues: {
            title: '',
            content: '',
        },
    });

    const content = useWatch({
        control: form.control,
        name: 'content',
    });

    async function onSubmit(data: CreatePromptDto) {
        const result = await createPromptAction(data);

        if (!result.success) {
            toast.error(result.message);
            return;
        }

        toast.success(result.message);
        router.refresh();
        form.reset();
    }

    return (
        <form
            action=""
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmit)}
        >
            <header className="flex flex-wrap gap-2 items-center mb-6 justify-end">
                <CopyButton textToCopy={content} />

                <Button type="submit" size="sm">
                    Salvar
                </Button>
            </header>
            <Controller
                control={form.control}
                name="title"
                render={({ field }) => (
                    <>
                        <Input
                            {...field}
                            placeholder="Título do prompt"
                            variant="transparent"
                            size="lg"
                            autoFocus
                            type="text"
                        />
                        <ErrorMessage
                            control={form.control}
                            name="title"
                            render={({ message }) => (
                                <p className="text-red-500">{message}</p>
                            )}
                        />
                    </>
                )}
            />
            <Controller
                control={form.control}
                name="content"
                render={({ field }) => (
                    <>
                        <Textarea
                            {...field}
                            placeholder="Digite o conteúdo do prompt."
                            variant="transparent"
                            size="lg"
                        />
                        <ErrorMessage
                            control={form.control}
                            name="content"
                            render={({ message }) => (
                                <p className="text-red-500">{message}</p>
                            )}
                        />
                    </>
                )}
            />
        </form>
    );
};
