<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Contracts\BibTeXParserInterface;
use App\Contracts\WorkspaceManagerInterface;
use App\DTOs\BibEntryDTO;
use App\Models\Project;
use Illuminate\Http\JsonResponse;

class BibliographyController extends Controller
{
    /**
     * Scan workspace for .bib files, parse them, and return structured citation entries.
     */
    public function index(
        Project $project,
        WorkspaceManagerInterface $workspaceManager,
        BibTeXParserInterface $parser,
    ): JsonResponse {
        $tree = $workspaceManager->tree($project);
        $entries = [];

        foreach ($tree->nodes as $node) {
            if (! $node->isDir && strtolower($node->extension) === 'bib') {
                try {
                    $content = $workspaceManager->read($project, $node->path);
                    $parsed = $parser->parse($content);
                    foreach ($parsed as $entry) {
                        $entries[] = $entry;
                    }
                } catch (\Throwable) {
                    // Ignore unreadable files and continue
                    continue;
                }
            }
        }

        return response()->json([
            'data' => array_map(fn (BibEntryDTO $e) => $e->toArray(), $entries),
            'total' => count($entries),
        ]);
    }
}
