import { Prompt } from '@/core/domain/prompts/prompt.entity';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPromptRepository } from '@/infra/repository/prisma-prompt.repository';

type PromptDelegateMock = {
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
