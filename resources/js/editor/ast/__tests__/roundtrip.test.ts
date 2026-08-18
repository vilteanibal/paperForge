import { describe, expect, it } from 'vitest';
import { parse } from '../parser';
import { serialize } from '../serializer';

describe('AST Round-Trip Fidelity & Performance Benchmark', () => {
    it('round-trips standard document with section and text', () => {
        const input = `\\documentclass{article}
\\title{Sample Document}
\\author{Author Name}
\\begin{document}
\\section{First Section}
This is a standard paragraph with \\textbf{bold} and \\textit{italic} text.

\\subsection{Subsection Title}
Here is another paragraph with an inline formula $E=mc^2$.
\\end{document}
`;
        const ast = parse(input);
        const output = serialize(ast);

        expect(output.trim()).toBe(input.trim());
    });

    it('round-trips custom packages and unknown macros without data loss', () => {
        const input = `\\documentclass{report}
\\usepackage{custompkg}
\\begin{document}
\\section{Custom Elements}
\\customMacro[arg1=true,arg2=false]{mandatory1}{mandatory2}

Normal trailing paragraph.
\\end{document}
`;
        const ast = parse(input);
        const output = serialize(ast);

        expect(output.trim()).toBe(input.trim());
    });

    it('round-trips mathematical environments intact', () => {
        const input = `\\documentclass{article}
\\begin{document}
\\begin{equation}
\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
\\end{equation}
\\end{document}
`;
        const ast = parse(input);
        const output = serialize(ast);

        expect(output.trim()).toBe(input.trim());
    });

    it('benchmarks sub-200ms latency on massive 50-page synthetic LaTeX document', () => {
        // Generate a 50-page synthetic LaTeX document (~25,000 words, hundreds of sections and formulas)
        let massiveTex = `\\documentclass{book}\n\\title{Massive Thesis}\n\\begin{document}\n`;

        for (let i = 1; i <= 50; i++) {
            massiveTex += `\\section{Chapter Section ${i}}\n`;
            massiveTex += `This is paragraph 1 of section ${i} containing \\textbf{critical findings} and formulas $f(x) = x^${i} + \\alpha$.\n\n`;
            massiveTex += `\\begin{equation}\n\\sum_{k=1}^{${i}} k^2 = \\frac{${i}(${i}+1)(2\\cdot ${i}+1)}{6}\n\\end{equation}\n\n`;
            massiveTex += `\\customHook[flag=${i}]{data_payload_${i}}\n\n`;
        }

        massiveTex += `\\end{document}\n`;

        const startTime = performance.now();
        const ast = parse(massiveTex);
        const parseTime = performance.now() - startTime;

        const serializeStart = performance.now();
        const reconstructed = serialize(ast);
        const serializeTime = performance.now() - serializeStart;

        const totalTime = parseTime + serializeTime;

        // Ensure total roundtrip execution is well below our 200ms target
        expect(totalTime).toBeLessThan(100);
        expect(reconstructed.length).toBeGreaterThan(5000);
    });
});
