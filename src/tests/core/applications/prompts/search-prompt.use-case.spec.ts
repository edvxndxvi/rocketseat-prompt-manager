import { SearchPromptsUseCase } from '@/core/application/prompts/search-prompts.use-case';
import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PromptRepository } from '@/core/domain/prompts/prompt.repository';

describe('SearchPromptsUseCase', () => {
    const input: Prompt[] = [
        {
            id: '1',
            title: 'title 01',
            content: 'content 01',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '2',
            title: 'title 02',
            content: 'content 02',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
    ];

    const repository: PromptRepository = {
        findMany: async () => input,
        searchMany: async (term) =>
            input.filter(
                (prompt) =>
                    prompt.title.toLowerCase().includes(term.toLowerCase()) ||
                    prompt.content.toLowerCase().includes(term.toLowerCase())
            ),
    };

    it('deve retornar todos os prompts quando o termo for vazio', async () => {
        const useCase = new SearchPromptsUseCase(repository);

        const result = await useCase.execute('');
        expect(result).toHaveLength(2);
        expect(result).toEqual(input);
    });

    it('deve filtrar a lista de prompts com base no termo de busca', async () => {
        const useCase = new SearchPromptsUseCase(repository);

        const result = await useCase.execute('01');
        expect(result).toEqual([input[0]]);
    });

    it('deve aplicar trim em buscas com termo com espaços em branco e retornar toda a lista de prompts', async () => {
        const findMany = jest.fn().mockResolvedValue(input);
        const searchMany = jest.fn().mockResolvedValue([]);
        const repositoryWithSpies: PromptRepository = {
            ...repository,
            findMany,
            searchMany,
        };

        const useCase = new SearchPromptsUseCase(repositoryWithSpies);

        const result = await useCase.execute('    ');
        expect(result).toHaveLength(2);
        expect(findMany).toHaveBeenCalledTimes(1);
        expect(searchMany).not.toHaveBeenCalled();
    });

    it('deve buscar termo com espaços em branco, tratando com trim', async () => {
        const firtElement = input.slice(0, 1);
        const findMany = jest.fn().mockResolvedValue(input);
        const searchMany = jest.fn().mockResolvedValue(firtElement);
        const repositoryWithSpies: PromptRepository = {
            ...repository,
            findMany,
            searchMany,
        };

        const useCase = new SearchPromptsUseCase(repositoryWithSpies);
        const query = ' title 02 ';
        const result = await useCase.execute(query);

        expect(result).toMatchObject(firtElement);
        expect(searchMany).toHaveBeenCalledWith(query.trim());
        expect(findMany).not.toHaveBeenCalled();
    });

    it('deve lidar com termo undefined ou null e retornar a lista completa de prompts', async () => {
        const findMany = jest.fn().mockResolvedValue(input);
        const searchMany = jest.fn().mockResolvedValue([]);
        const repositoryWithSpies: PromptRepository = {
            ...repository,
            findMany,
            searchMany,
        };

        const useCase = new SearchPromptsUseCase(repositoryWithSpies);
        const query = undefined as unknown as string;
        const result = await useCase.execute(query);

        expect(result).toMatchObject(input);
        expect(findMany).toHaveBeenCalledTimes(1);
        expect(searchMany).not.toHaveBeenCalled();
    });
});
