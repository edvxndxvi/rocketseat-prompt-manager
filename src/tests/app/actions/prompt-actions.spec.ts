import {
    searchPromptAction,
    createPromptAction,
} from '@/app/actions/prompt.actions';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));
const mockedSearchExcecute = jest.fn();
const mockedCreateExcecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
    SearchPromptsUseCase: jest.fn().mockImplementation(() => ({
        execute: mockedSearchExcecute,
    })),
}));
jest.mock('@/core/application/prompts/create-prompt.use-case', () => ({
    CreatePromptUseCase: jest.fn().mockImplementation(() => ({
        execute: mockedCreateExcecute,
    })),
}));

describe('Server Actions: Prompts', () => {
    beforeEach(() => {
        mockedSearchExcecute.mockReset();
        mockedCreateExcecute.mockReset();
    });

    describe('createPromptAction', () => {
        it('deve retornar erro de validação quando os campos forem vazios', async () => {
            const invalidData = {
                title: '',
                content: '',
            };

            const result = await createPromptAction(invalidData);

            expect(result?.success).toBe(false);
            expect(result?.message).toBe('Erro de validação');
            expect(result?.errors).toBeDefined();
        });

        it('deve retornar erro quando o prompt já existe', async () => {
            mockedCreateExcecute.mockRejectedValue(
                new Error('PROMPT_ALREADY_EXISTS')
            );

            const existingData = {
                title: 'Existing Prompt',
                content: 'Content for existing prompt',
            };

            const result = await createPromptAction(existingData);

            expect(result?.success).toBe(false);
            expect(result?.message).toBe('Este prompt já existe.');
        });

        it('deve criar um prompt com sucesso', async () => {
            mockedCreateExcecute.mockResolvedValue(undefined);

            const newData = {
                title: 'New Prompt',
                content: 'Content for new prompt',
            };

            const result = await createPromptAction(newData);

            expect(result?.success).toBe(true);
            expect(result?.message).toBe('Prompt criado com sucesso.');
        });

        it('deve retornar erro genérico ao falhar na criação', async () => {
            mockedCreateExcecute.mockRejectedValue(new Error('UNKNOWN'));

            const newData = {
                title: 'New Prompt',
                content: 'Content for new prompt',
            };

            const result = await createPromptAction(newData);

            expect(result?.success).toBe(false);
            expect(result?.message).toBe('Falha ao criar prompt.');
        });
    });

    describe('searchPromptAction', () => {
        it('deve retornar sucesso com o termo de busca não vazio', async () => {
            const input = [
                {
                    id: 1,
                    title: 'AI Prompt 1',
                    content: 'Content for AI Prompt 1',
                },
            ];
            mockedSearchExcecute.mockResolvedValue(input);

            const formData = new FormData();
            formData.append('q', 'AI');

            const result = await searchPromptAction(
                { success: true },
                formData
            );
            expect(result.success).toBe(true);
            expect(result.prompts).toEqual(input);
        });

        it('deve retornar sucesso e listar todos os prompts quando o termo for vazio', async () => {
            const input = [
                {
                    id: 1,
                    title: 'AI Prompt 1',
                    content: 'Content for AI Prompt 1',
                },
                {
                    id: 2,
                    title: 'AI Prompt 2',
                    content: 'Content for AI Prompt 2',
                },
                {
                    id: 3,
                    title: 'AI Prompt 3',
                    content: 'Content for AI Prompt 3',
                },
            ];
            mockedSearchExcecute.mockResolvedValue(input);

            const formData = new FormData();
            formData.append('q', '');

            const result = await searchPromptAction(
                { success: true },
                formData
            );
            expect(result.success).toBeDefined();
            expect(result.prompts).toEqual(input);
        });

        it('deve retornar um erro genérico ao falhar na busca', async () => {
            mockedSearchExcecute.mockRejectedValue(new Error('UNKNOWN'));

            const formData = new FormData();
            formData.append('q', 'AI');

            const result = await searchPromptAction(
                { success: true },
                formData
            );

            expect(result.success).toBe(false);
            expect(result.prompts).toBe(undefined);
            expect(result.message).toBe('Falha ao buscar prompts.');
        });

        it('deve aparar espaços do termo antes de executar', async () => {
            const input = [
                { id: 1, title: 'Title 01', content: 'Content for Title 01' },
            ];
            mockedSearchExcecute.mockResolvedValue(input);

            const formData = new FormData();
            formData.append('q', '  AI  ');

            const result = await searchPromptAction(
                { success: true },
                formData
            );

            expect(mockedSearchExcecute).toHaveBeenCalledWith('AI');
            expect(result.success).toBe(true);
            expect(result.prompts).toEqual(input);
        });

        it('deve tratar ausência da query como termo vazio', async () => {
            const input = [
                {
                    id: 1,
                    title: 'first title',
                    content: 'Content for Title 01',
                },
                {
                    id: 2,
                    title: 'second title',
                    content: 'Content for Title 02',
                },
            ];
            mockedSearchExcecute.mockResolvedValue(input);

            const formData = new FormData();

            const result = await searchPromptAction(
                { success: true },
                formData
            );

            expect(mockedSearchExcecute).toHaveBeenCalledWith('');
            expect(result.success).toBe(true);
            expect(result.prompts).toEqual(input);
        });
    });
});
