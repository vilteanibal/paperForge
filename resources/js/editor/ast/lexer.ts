import type { SourceLocation, SourcePosition, Token, TokenType } from './types';

export class LaTeXLexer {
    private input: string;
    private length: number;
    private cursor: number = 0;
    private line: number = 1;
    private column: number = 1;

    constructor(input: string) {
        this.input = input;
        this.length = input.length;
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];

        while (this.cursor < this.length) {
            const token = this.nextToken();
            if (token) {
                tokens.push(token);
            }
        }

        tokens.push({
            type: 'EOF',
            value: '',
            loc: this.createLocation(this.getPosition(), this.getPosition()),
        });

        return tokens;
    }

    private nextToken(): Token | null {
        if (this.cursor >= this.length) {
            return null;
        }

        const startPos = this.getPosition();
        const char = this.input[this.cursor];

        // 1. Comments: % ... until newline
        if (char === '%') {
            let comment = '';
            while (this.cursor < this.length && this.input[this.cursor] !== '\n') {
                comment += this.input[this.cursor];
                this.advance();
            }
            return {
                type: 'COMMENT',
                value: comment,
                loc: this.createLocation(startPos, this.getPosition()),
            };
        }

        // 2. Newlines
        if (char === '\n') {
            this.advance();
            return {
                type: 'NEWLINE',
                value: '\n',
                loc: this.createLocation(startPos, this.getPosition()),
            };
        }

        // 3. Braces and Brackets
        if (char === '{') {
            this.advance();
            return { type: 'BRACE_OPEN', value: '{', loc: this.createLocation(startPos, this.getPosition()) };
        }
        if (char === '}') {
            this.advance();
            return { type: 'BRACE_CLOSE', value: '}', loc: this.createLocation(startPos, this.getPosition()) };
        }
        if (char === '[') {
            this.advance();
            return { type: 'BRACKET_OPEN', value: '[', loc: this.createLocation(startPos, this.getPosition()) };
        }
        if (char === ']') {
            this.advance();
            return { type: 'BRACKET_CLOSE', value: ']', loc: this.createLocation(startPos, this.getPosition()) };
        }

        // 4. Math: $$ ... $$ (display) or $ ... $ (inline)
        if (char === '$') {
            if (this.cursor + 1 < this.length && this.input[this.cursor + 1] === '$') {
                // $$ display math
                this.advance(); // skip 1st $
                this.advance(); // skip 2nd $
                let math = '';
                while (this.cursor < this.length) {
                    if (this.input[this.cursor] === '$' && this.cursor + 1 < this.length && this.input[this.cursor + 1] === '$') {
                        this.advance();
                        this.advance();
                        break;
                    }
                    math += this.input[this.cursor];
                    this.advance();
                }
                return {
                    type: 'MATH_DISPLAY',
                    value: math,
                    loc: this.createLocation(startPos, this.getPosition()),
                };
            } else {
                // $ inline math
                this.advance(); // skip $
                let math = '';
                while (this.cursor < this.length) {
                    if (this.input[this.cursor] === '$' && this.input[this.cursor - 1] !== '\\') {
                        this.advance();
                        break;
                    }
                    math += this.input[this.cursor];
                    this.advance();
                }
                return {
                    type: 'MATH_INLINE',
                    value: math,
                    loc: this.createLocation(startPos, this.getPosition()),
                };
            }
        }

        // 5. Backslash commands / math delimiters \[ \] \( \)
        if (char === '\\') {
            if (this.cursor + 1 < this.length) {
                const next = this.input[this.cursor + 1];

                // \[ ... \] display math
                if (next === '[') {
                    this.advance(); // \
                    this.advance(); // [
                    let math = '';
                    while (this.cursor < this.length) {
                        if (this.input[this.cursor] === '\\' && this.cursor + 1 < this.length && this.input[this.cursor + 1] === ']') {
                            this.advance();
                            this.advance();
                            break;
                        }
                        math += this.input[this.cursor];
                        this.advance();
                    }
                    return {
                        type: 'MATH_DISPLAY',
                        value: math,
                        loc: this.createLocation(startPos, this.getPosition()),
                    };
                }

                // \( ... \) inline math
                if (next === '(') {
                    this.advance(); // \
                    this.advance(); // (
                    let math = '';
                    while (this.cursor < this.length) {
                        if (this.input[this.cursor] === '\\' && this.cursor + 1 < this.length && this.input[this.cursor + 1] === ')') {
                            this.advance();
                            this.advance();
                            break;
                        }
                        math += this.input[this.cursor];
                        this.advance();
                    }
                    return {
                        type: 'MATH_INLINE',
                        value: math,
                        loc: this.createLocation(startPos, this.getPosition()),
                    };
                }

                // Single non-alpha character after backslash (like \%, \$, \\, \&, \_, \{, \})
                if (!/[a-zA-Z]/.test(next)) {
                    this.advance(); // \
                    const sym = this.input[this.cursor];
                    this.advance(); // sym
                    return {
                        type: 'COMMAND',
                        value: '\\' + sym,
                        loc: this.createLocation(startPos, this.getPosition()),
                    };
                }
            }

            // Normal command: \commandName and optional *
            let cmd = '\\';
            this.advance(); // \
            while (this.cursor < this.length && /[a-zA-Z]/.test(this.input[this.cursor])) {
                cmd += this.input[this.cursor];
                this.advance();
            }
            if (this.cursor < this.length && this.input[this.cursor] === '*') {
                cmd += '*';
                this.advance();
            }

            return {
                type: 'COMMAND',
                value: cmd,
                loc: this.createLocation(startPos, this.getPosition()),
            };
        }

        // 6. Normal text chunking
        let text = '';
        while (this.cursor < this.length) {
            const c = this.input[this.cursor];
            if (c === '\\' || c === '{' || c === '}' || c === '[' || c === ']' || c === '$' || c === '%' || c === '\n') {
                break;
            }
            text += c;
            this.advance();
        }

        return {
            type: 'TEXT',
            value: text,
            loc: this.createLocation(startPos, this.getPosition()),
        };
    }

    private advance(): void {
        if (this.cursor < this.length) {
            if (this.input[this.cursor] === '\n') {
                this.line++;
                this.column = 1;
            } else {
                this.column++;
            }
            this.cursor++;
        }
    }

    private getPosition(): SourcePosition {
        return {
            line: this.line,
            column: this.column,
            offset: this.cursor,
        };
    }

    private createLocation(start: SourcePosition, end: SourcePosition): SourceLocation {
        return { start, end };
    }
}

export function tokenize(input: string): Token[] {
    const lexer = new LaTeXLexer(input);
    return lexer.tokenize();
}
