import { prisma } from '@/lib/prisma';
import { SidebarContent } from './sidebar-content';

export const Sidebar = async () => {
    const prompts = await prisma.prompt.findMany();

    return (
        <SidebarContent
            prompts={[
                {
                    id: '1',
                    title: 'Prompt 1',
                    content: 'Conteúdo do prompt 1',
                },
            ]}
        />
    );
};
