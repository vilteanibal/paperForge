<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class FileOperationException extends HttpException
{
    public function __construct(string $message = 'File system operation failed.', int $statusCode = 422)
    {
        parent::__construct($statusCode, $message);
    }
}
