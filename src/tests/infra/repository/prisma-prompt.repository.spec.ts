import { CreatePromptDto } from '@/core/application/prompts/create-prompt.dto';
import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';

type PromptDelegateMock = {
    create: jest.MockedFunction<
        (args: { data: CreatePromptDto }) => Promise<void>
    >;
    findByTitle: jest.MockedFunction<
        (args: {
            where: { title: string };
        }) => Promise<Pick<Prompt, 'id' | 'title' | 'content'> | null>
    >;
    findMany: jest.MockedFunction<
        (args: {
            orderBy?: { createdAt: 'asc' | 'desc' };
            where?: {
                OR?: Array<{
                    title?: { contains: string; mode: 'insensitive' };
                    content?: { contains: string; mode: 'insensitive' };
                }>;
            };
        }) => Promise<Prompt[]>
    >;
};

type PrismaMock = {
    prompt: PromptDelegateMock;
};

function createMockPrisma() {
    const mock: PrismaMock = {
        prompt: {
            create: jest.fn(),
            findByTitle: jest.fn(),
            findMany: jest.fn(),
        },
    };
    return mock as unknown as PrismaClient & PrismaMock;
}

describe('PrismaPromptRepository', () => {
    let prisma: ReturnType<typeof createMockPrisma>;
    let repository: PrismaPromptRepository;

    beforeEach(() => {
        prisma = createMockPrisma();
        repository = new PrismaPromptRepository(prisma);
    });

    describe('create', () => {
        it('deve chamar o método create com os dados corretos', async () => {
            const input = {
                title: 'Title 1',
                content: 'Content 1',
            };

            await repository.create(input);
            expect(prisma.prompt.create).toHaveBeenCalledWith({ data: input });
        });
    });

    describe('findByTitle', () => {
        it('deve chamar corretamente o método findByTitle com o title', async () => {
            const title = 'Title 1';
            const input = {
                id: '1',
                title,
                content: 'Content 1',
            };

            prisma.prompt.findByTitle.mockResolvedValue(input);

            const result = await repository.findByTitle(title);

            expect(prisma.prompt.findByTitle).toHaveBeenCalledWith({
                where: { title },
            });
            expect(result).toEqual(input);
        });
    });

    describe('findMany', () => {
        it('deve ordenar por createdAt desc e mapear os resultados', async () => {
            const now = new Date();
            const input = [
                {
                    id: '1',
                    title: 'Title 1',
                    content: 'Content 1',
                    createdAt: now,
                    updatedAt: now,
                },
                {
                    id: '2',
                    title: 'Title 2',
                    content: 'Content 2',
                    createdAt: now,
                    updatedAt: now,
                },
            ];

            prisma.prompt.findMany.mockResolvedValue(input);

            const result = await repository.findMany();

            expect(prisma.prompt.findMany).toHaveBeenCalledWith({
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual(input);
        });
    });

    describe('searchMany', () => {
        it('deve buscar por termo vazio e não enviar o where', async () => {
            const now = new Date();
            const input = [
                {
                    id: '1',
                    title: 'Title 1',
                    content: 'Content 1',
                    createdAt: now,
                    updatedAt: now,
                },
            ];

            prisma.prompt.findMany.mockResolvedValue(input);

            const result = await repository.searchMany('   ');

            expect(prisma.prompt.findMany).toHaveBeenCalledWith({
                where: undefined,
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual(input);
        });

        it('deve buscar por termo e popular OR no where', async () => {
            const now = new Date();
            const input = [
                {
                    id: '1',
                    title: 'Title 1',
                    content: 'Content 1',
                    createdAt: now,
                    updatedAt: now,
                },
            ];

            prisma.prompt.findMany.mockResolvedValue(input);

            const result = await repository.searchMany('   Title 1   ');

            expect(prisma.prompt.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { title: { contains: 'Title 1', mode: 'insensitive' } },
                        {
                            content: {
                                contains: 'Title 1',
                                mode: 'insensitive',
                            },
                        },
                    ],
                },
                orderBy: { createdAt: 'desc' },
            });
            expect(result).toEqual(input);
        });
    });
});
