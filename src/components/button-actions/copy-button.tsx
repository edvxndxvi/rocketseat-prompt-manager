'use client';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';

export type CopyButtonProps = {
    textToCopy: string;
};

export function CopyButton({ textToCopy }: CopyButtonProps) {
    const [isCopied, setIsCopied] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const isContentEmpty = !textToCopy.trim();

    const clearTimer = () => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    };

    const handleCopy = async () => {
        const text = textToCopy.trim();

        clearTimer();

        try {
            await navigator.clipboard.writeText(text);
            setIsCopied(true);

            timerRef.current = setTimeout(() => setIsCopied(false), 1000);
        } catch (error) {
            const _error = error as Error;
            toast.error('Erro ao copiar o texto: ' + _error.message);
        }
    };

    useEffect(() => {
        return () => {
            clearTimer();
        };
    }, []);

    return (
        <Button
            variant="outline"
            type="button"
            size="sm"
            className="disabled:opacity-50"
            disabled={isContentEmpty}
            onClick={handleCopy}
        >
            {isCopied ? (
                <Check className="w-4 h-4 text-green-400" />
            ) : (
                <Copy className="w-4 h-4" />
            )}
            <span className="ml-2">{isCopied ? 'Copiado' : 'Copiar'}</span>
        </Button>
    );
}
