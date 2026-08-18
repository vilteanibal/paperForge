<?php

declare(strict_types=1);

namespace App\Enums;

enum CompilerEngine: string
{
    case PdfLaTeX = 'pdflatex';
    case XeLaTeX = 'xelatex';
    case LuaLaTeX = 'lualatex';
}
