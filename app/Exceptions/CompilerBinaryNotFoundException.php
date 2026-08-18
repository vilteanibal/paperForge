<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class CompilerBinaryNotFoundException extends HttpException
{
    public function __construct(string $message = 'Specified TeX Live compiler binary is not installed or accessible on host system.')
    {
        parent::__construct(500, $message);
    }
}
