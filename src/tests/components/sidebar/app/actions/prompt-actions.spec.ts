import { searchPromptAction } from '@/app/actions/prompt.actions';

jest.mock('@/lib/prisma', () => ({ prisma: {} }));
const mockedSearchExcecute = jest.fn();

jest.mock('@/core/application/prompts/search-prompts.use-case', () => ({
    SearchPromptsUseCase: jest.fn().mockImplementation(() => ({
        execute: mockedSearchExcecute,
    })),
}));

describe('Server Actions: Prompts', () => {
    beforeEach(() => {
        mockedSearchExcecute.mockReset();
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
