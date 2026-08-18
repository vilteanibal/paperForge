import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroSection } from '../components/HeroSection';

describe('HeroSection Component', () => {
    it('renders headline, value pills, and CTA links', () => {
        render(<HeroSection />);

        expect(screen.getByText(/Craft scientific papers with/i)).toBeDefined();
        expect(screen.getByText(/unrivaled elegance/i)).toBeDefined();
        expect(screen.getByText(/Start Writing Free/i)).toBeDefined();
        expect(screen.getByText(/Explore Capabilities/i)).toBeDefined();
        expect(screen.getByText(/100% Local-First Storage/i)).toBeDefined();
        expect(screen.getByText(/pdfLaTeX • XeLaTeX • LuaLaTeX/i)).toBeDefined();
    });
});
