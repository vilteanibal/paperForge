<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class InvalidSymlinkException extends HttpException
{
    public function __construct(string $message = 'Access denied: Symbolic links outside the workspace are forbidden.')
    {
        parent::__construct(403, $message);
    }
}
