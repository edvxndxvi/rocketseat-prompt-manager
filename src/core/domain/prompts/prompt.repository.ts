import { CreatePromptDto } from '@/core/application/prompts/create-prompt.dto';
import { Prompt } from './prompt.entity';

export interface PromptRepository {
    create(ddata: CreatePromptDto): Promise<void>;
    findMany(): Promise<Prompt[]>;
    findByTitle(title: string): Promise<Prompt | null>;
    searchMany(term: string): Promise<Prompt[]>;
}
