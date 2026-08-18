<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class PathOutOfBoundsException extends HttpException
{
    public function __construct(string $message = 'Access denied: Path is outside the project workspace.')
    {
        parent::__construct(403, $message);
    }
}
