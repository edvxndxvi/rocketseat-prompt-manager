import { PromptSummary } from '@/core/domain/prompts/prompt.entity';
import { PromptCard } from './prompt-card';

type PromptListProps = {
    prompts: PromptSummary[];
};

export const PromptList = ({ prompts }: PromptListProps) => {
    console.log(prompts);
    return (
        <ul className="space-y-2">
            {prompts.map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} />
            ))}
        </ul>
    );
};
