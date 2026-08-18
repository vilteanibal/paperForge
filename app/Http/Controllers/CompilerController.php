<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Contracts\CompilerOrchestratorInterface;
use App\Contracts\WorkspaceManagerInterface;
use App\Http\Requests\Compiler\CompileRequest;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CompilerController extends Controller
{
    public function __construct(
        protected CompilerOrchestratorInterface $compiler,
        protected WorkspaceManagerInterface $workspaceManager,
    ) {}

    /**
     * Trigger a sandboxed TeX Live compilation for the project.
     */
    public function compile(Project $project, CompileRequest $request): JsonResponse
    {
        $timeout = (int) ($request->validated('timeout') ?? 60);
        $result = $this->compiler->compile($project, $timeout);

        return response()->json($result->toArray());
    }

    /**
     * Stream or download the compiled PDF binary file.
     *
     * @throws NotFoundHttpException
     */
    public function downloadPdf(Project $project): BinaryFileResponse
    {
        $setting = $project->setting;
        $mainFile = $setting !== null ? $setting->main_file : 'main.tex';
        $baseName = pathinfo($mainFile, PATHINFO_FILENAME);
        $pdfRelative = $baseName.'.pdf';

        $root = $this->workspaceManager->getRootPath($project);
        $pdfPath = $root.DIRECTORY_SEPARATOR.$pdfRelative;

        if (! file_exists($pdfPath)) {
            throw new NotFoundHttpException("Compiled PDF '{$pdfRelative}' does not exist for this project.");
        }

        return response()->file($pdfPath, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'inline; filename="'.$pdfRelative.'"',
        ]);
    }
}
