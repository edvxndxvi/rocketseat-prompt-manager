import {
    SidebarContent,
    SidebarContentProps,
} from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';
import { userEvent } from '@testing-library/user-event';

const pushMock = jest.fn();
// o useRouter é uma dependência externa do teste,
// o mock de JEST substitui a função para uma mocada para evitar erros
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}));

const initialPrompts = [
    {
        id: '1',
        title: 'Prompt 1',
        content: 'Conteúdo do prompt 1',
    },
];

// SUT = System under Test
const makeSut = (
    {
        prompts = initialPrompts,
    }: SidebarContentProps = {} as SidebarContentProps
) => {
    return render(<SidebarContent prompts={prompts} />);
};

describe('SidebarContent', () => {
    const user = userEvent.setup();

    describe('Base', () => {
        it('Deveria renderizar botão para criar um novo prompt', () => {
            makeSut();

            expect(
                screen.getByRole('button', { name: 'Novo prompt' })
            ).toBeVisible();
        });

        it('Deveria renderizar lista de prompts', () => {
            const input = [
                {
                    id: '1',
                    title: 'exemplo 1',
                    content: 'Conteúdo do exemplo 1',
                },
                {
                    id: '2',
                    title: 'exemplo 2',
                    content: 'Conteúdo do exemplo 2',
                },
            ];
            makeSut({ prompts: input });

            expect(screen.getByText(input[0].title)).toBeInTheDocument();
            expect(screen.getAllByRole('paragraph')).toHaveLength(input.length);
        });

        it('Deveria atualizar o campo de busca ao digitar', async () => {
            const text = 'AI';
            makeSut();

            const searchInput =
                screen.getByPlaceholderText('Buscar prompts...');
            await user.type(searchInput, text);

            expect(searchInput).toHaveValue(text);
        });
    });

    describe('Colapsar / Expandir', () => {
        it('Deveria iniciar expandida e exibir botão minimizar', () => {
            makeSut();

            const aside = screen.getByRole('complementary');
            expect(aside).toBeVisible();

            const collapseButton = screen.getByRole('button', {
                name: /minimizar sidebar/i,
            });
            expect(collapseButton).toBeVisible();

            const expandButton = screen.queryByRole('button', {
                name: /expandir sidebar/i,
            });
            expect(expandButton).not.toBeInTheDocument();
        });

        // Nesse teste, simulamos o clique no botão de colapsar e verificamos se o botão de expandir aparece

        // Por essa razão deve ser uma função async
        it('Deveria colapsar e exibir botão expandir', async () => {
            makeSut();
            const collapseButton = screen.getByRole('button', {
                name: /minimizar sidebar/i,
            });

            // Simula um user clicando para colapsar a sidebar
            await user.click(collapseButton);

            const expandButton = screen.getByRole('button', {
                name: /expandir sidebar/i,
            });

            expect(expandButton).toBeVisible();
            expect(collapseButton).not.toBeInTheDocument();
        });
    });

    describe('Novo prompt', () => {
        it('Deveria navegar o usuário para página de novo prompt', async () => {
            makeSut();
            const newButton = screen.getByRole('button', {
                name: 'Novo prompt',
            });

            await user.click(newButton);

            expect(pushMock).toHaveBeenCalledWith('/new');
        });
    });

    describe('Busca', () => {
        it('Deveria navegar com URL codificada ao digitar e limpar', async () => {
            const text = 'A B';
            makeSut();
            const searchInput =
                screen.getByPlaceholderText('Buscar prompts...');

            await user.type(searchInput, text);

            expect(pushMock).toHaveBeenCalled();
            const lastCall = pushMock.mock.calls.at(-1);
            expect(lastCall?.[0]).toBe('/q?=A%20B');

            await user.clear(searchInput);
            const lastClearCall = pushMock.mock.calls.at(-1);
            expect(lastClearCall?.[0]).toBe('/');
        });
    });
});
