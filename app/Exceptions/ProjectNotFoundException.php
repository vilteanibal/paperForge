<?php

declare(strict_types=1);

namespace App\Exceptions;

use Symfony\Component\HttpKernel\Exception\HttpException;

class ProjectNotFoundException extends HttpException
{
    public function __construct(string $message = 'The requested project workspace does not exist.')
    {
        parent::__construct(404, $message);
    }
}
