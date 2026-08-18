<?php

declare(strict_types=1);

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Symfony\Component\HttpFoundation\Response;

class SocialAuthController extends Controller
{
    /**
     * Supported OAuth providers.
     *
     * @var list<string>
     */
    protected const ALLOWED_PROVIDERS = ['google', 'github'];

    /**
     * Redirect the user to the provider's OAuth authentication page.
     */
    public function redirect(string $provider): RedirectResponse
    {
        if (! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            abort(Response::HTTP_NOT_FOUND, "Provider [{$provider}] is not supported.");
        }

        /** @var RedirectResponse */
        return Socialite::driver($provider)->redirect();
    }

    /**
     * Obtain the user information from the provider and authenticate.
     */
    public function callback(string $provider): RedirectResponse
    {
        if (! in_array($provider, self::ALLOWED_PROVIDERS, true)) {
            abort(Response::HTTP_NOT_FOUND, "Provider [{$provider}] is not supported.");
        }

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (\Throwable $e) {
            return redirect()->route('login')->withErrors([
                'email' => 'Unable to authenticate using '.$provider.'. Please try again.',
            ]);
        }

        $socialId = (string) $socialUser->getId();
        $email = $socialUser->getEmail();

        if (empty($email)) {
            return redirect()->route('login')->withErrors([
                'email' => 'No email address was provided by '.$provider.'.',
            ]);
        }

        // 1. Check if social account already exists
        $socialAccount = SocialAccount::where('provider', $provider)
            ->where('provider_id', $socialId)
            ->first();

        if ($socialAccount !== null) {
            Auth::login($socialAccount->user, remember: true);

            return redirect()->intended(route('dashboard'));
        }

        // 2. Check if user already exists with matching email
        $user = User::where('email', $email)->first();

        if ($user === null) {
            $name = $socialUser->getName() ?? $socialUser->getNickname() ?? 'Paperforge Scholar';

            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => Hash::make(Str::random(32)),
                'email_verified_at' => now(),
            ]);
        }

        // 3. Link social account
        $user->socialAccounts()->create([
            'provider' => $provider,
            'provider_id' => $socialId,
        ]);

        Auth::login($user, remember: true);

        return redirect()->intended(route('dashboard'));
    }
}
