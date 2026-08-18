<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\Feature;
use Illuminate\Database\Seeder;

class FeatureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $features = [
            [
                'icon' => 'Lightning',
                'title' => 'Local-First Zero Latency',
                'description' => 'Edit and compile complex LaTeX papers offline at instantaneous speeds without server-side lag or upload delays.',
                'sort_order' => 1,
            ],
            [
                'icon' => 'Eye',
                'title' => 'Hybrid Dual-Engine Editor',
                'description' => 'Effortlessly switch between raw Monaco LaTeX source code, side-by-side split view, and visual WYSIWYG editing.',
                'sort_order' => 2,
            ],
            [
                'icon' => 'ArrowsClockwise',
                'title' => 'Bidirectional SyncTeX',
                'description' => 'Navigate with sub-second precision between source lines and compiled PDF pages via single-click and double-click forward/reverse sync.',
                'sort_order' => 3,
            ],
            [
                'icon' => 'Cpu',
                'title' => 'Multi-Compiler Suite',
                'description' => 'Native support for pdfLaTeX, XeLaTeX modern font ecosystems, and programmable LuaLaTeX compilation engines.',
                'sort_order' => 4,
            ],
            [
                'icon' => 'ShieldCheck',
                'title' => 'Zero-Telemetry Isolation',
                'description' => 'Your proprietary research manuscripts and data stay encrypted and stored exclusively in your local storage.',
                'sort_order' => 5,
            ],
            [
                'icon' => 'Books',
                'title' => 'Integrated Bibliography & Citations',
                'description' => 'Seamless BibTeX parsing with intelligent autocomplete, reference diagnostics, and instant citation linking.',
                'sort_order' => 6,
            ],
        ];

        foreach ($features as $feature) {
            Feature::updateOrCreate(['title' => $feature['title']], $feature);
        }
    }
}
