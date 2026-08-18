import { describe, expect, it } from 'vitest';
import { tokenize } from '../lexer';

describe('LaTeXLexer', () => {
    it('tokenizes commands, braces, text and comments', () => {
        const input = '\\textbf{Hello world} % This is a comment\nNext line';
        const tokens = tokenize(input);

        expect(tokens).toHaveLength(9);
        expect(tokens[0]).toMatchObject({ type: 'COMMAND', value: '\\textbf' });
        expect(tokens[1]).toMatchObject({ type: 'BRACE_OPEN', value: '{' });
        expect(tokens[2]).toMatchObject({ type: 'TEXT', value: 'Hello world' });
        expect(tokens[3]).toMatchObject({ type: 'BRACE_CLOSE', value: '}' });
        expect(tokens[4]).toMatchObject({ type: 'TEXT', value: ' ' });
        expect(tokens[5]).toMatchObject({ type: 'COMMENT', value: '% This is a comment' });
        expect(tokens[6]).toMatchObject({ type: 'NEWLINE', value: '\n' });
        expect(tokens[7]).toMatchObject({ type: 'TEXT', value: 'Next line' });
        expect(tokens[8]).toMatchObject({ type: 'EOF', value: '' });
    });

    it('tokenizes inline math and display math correctly', () => {
        const input = '$E=mc^2$ and $$ \\int x dx $$';
        const tokens = tokenize(input);

        const inlineMath = tokens.find((t) => t.type === 'MATH_INLINE');
        const displayMath = tokens.find((t) => t.type === 'MATH_DISPLAY');

        expect(inlineMath?.value).toBe('E=mc^2');
        expect(displayMath?.value.trim()).toBe('\\int x dx');
    });

    it('tokenizes escaped symbols without breaking commands', () => {
        const input = '\\% 50\\$ and \\& special';
        const tokens = tokenize(input);

        expect(tokens[0]).toMatchObject({ type: 'COMMAND', value: '\\%' });
        expect(tokens[2]).toMatchObject({ type: 'COMMAND', value: '\\$' });
        expect(tokens[4]).toMatchObject({ type: 'COMMAND', value: '\\&' });
    });
});
