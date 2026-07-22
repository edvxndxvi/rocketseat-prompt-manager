import { SidebarContent } from '@/components/sidebar/sidebar-content';
import { render, screen } from '@/lib/test-utils';
import { userEvent } from '@testing-library/user-event';

// o useRouter é uma dependência externa do teste,
// o mock de JEST substitui a função para uma mocada para evitar erros
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// SUT = System under Test
const makeSut = () => {
    return render(<SidebarContent />);
};

describe('SidebarContent', () => {
    const user = userEvent.setup();

    it('Deveria renderizar botão para criar um novo prompt', () => {
        makeSut();

        expect(
            screen.getByRole('button', { name: 'Novo prompt' })
        ).toBeVisible();
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
});
