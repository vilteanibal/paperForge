<?php

namespace App\Providers;

use App\Contracts\BibTeXParserInterface;
use App\Contracts\CompilerOrchestratorInterface;
use App\Contracts\SyncTeXParserInterface;
use App\Contracts\TeXBinaryResolverInterface;
use App\Contracts\WorkspaceManagerInterface;
use App\Services\Bibliography\BibTeXParser;
use App\Services\Compiler\SyncTeXParser;
use App\Services\Compiler\TeXBinaryResolver;
use App\Services\Compiler\TexLiveOrchestrator;
use App\Services\Workspace\VirtualWorkspaceManager;
use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(
            WorkspaceManagerInterface::class,
            VirtualWorkspaceManager::class,
        );

        $this->app->singleton(
            TeXBinaryResolverInterface::class,
            TeXBinaryResolver::class,
        );

        $this->app->singleton(
            CompilerOrchestratorInterface::class,
            TexLiveOrchestrator::class,
        );

        $this->app->singleton(
            BibTeXParserInterface::class,
            BibTeXParser::class,
        );

        $this->app->singleton(
            SyncTeXParserInterface::class,
            SyncTeXParser::class,
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );

        RateLimiter::for(
            'local_api',
            fn (Request $request): Limit => Limit::perMinute(500)->by($request->ip() ?: '127.0.0.1'),
        );

        RateLimiter::for(
            'compiler_api',
            fn (Request $request): Limit => Limit::perMinute(60)->by($request->ip() ?: '127.0.0.1'),
        );
    }
}
