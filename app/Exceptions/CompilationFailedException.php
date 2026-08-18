<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class CompilationFailedException extends HttpException
{
    public function __construct(string $message = 'LaTeX compilation failed.', int $statusCode = 422)
    {
        parent::__construct($statusCode, $message);
    }
}
