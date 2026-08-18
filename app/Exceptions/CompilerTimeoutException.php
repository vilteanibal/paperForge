<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class CompilerTimeoutException extends HttpException
{
    public function __construct(string $message = 'LaTeX compilation exceeded the maximum execution timeout.')
    {
        parent::__construct(504, $message);
    }
}
