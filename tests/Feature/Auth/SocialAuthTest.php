<?php

declare(strict_types=1);

use App\Models\SocialAccount;
use App\Models\User;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Contracts\User as SocialiteUser;
use Laravel\Socialite\Facades\Socialite;

test('redirect to valid oauth provider returns redirect response', function () {
    $providerMock = Mockery::mock(Provider::class);
    $providerMock->shouldReceive('redirect')
        ->once()
        ->andReturn(redirect('https://accounts.google.com/o/oauth2/auth'));

    Socialite::shouldReceive('driver')
        ->with('google')
        ->once()
        ->andReturn($providerMock);

    $response = $this->get(route('social.redirect', ['provider' => 'google']));

    $response->assertRedirect('https://accounts.google.com/o/oauth2/auth');
});

test('redirect with invalid oauth provider returns 404', function () {
    $response = $this->get('/auth/unsupported/redirect');

    $response->assertNotFound();
});

test('oauth callback creates new user and links social account when user does not exist', function () {
    $socialUser = Mockery::mock(SocialiteUser::class);
    $socialUser->shouldReceive('getId')->andReturn('google-123456');
    $socialUser->shouldReceive('getEmail')->andReturn('newscholar@example.com');
    $socialUser->shouldReceive('getName')->andReturn('Ada Lovelace');
    $socialUser->shouldReceive('getNickname')->andReturn(null);

    $providerMock = Mockery::mock(Provider::class);
    $providerMock->shouldReceive('user')->once()->andReturn($socialUser);

    Socialite::shouldReceive('driver')
        ->with('google')
        ->once()
        ->andReturn($providerMock);

    $response = $this->get(route('social.callback', ['provider' => 'google']));

    $response->assertRedirect(route('dashboard'));

    $user = User::where('email', 'newscholar@example.com')->first();
    expect($user)->not->toBeNull();
    expect($user->name)->toBe('Ada Lovelace');

    $socialAccount = SocialAccount::where('user_id', $user->id)->first();
    expect($socialAccount)->not->toBeNull();
    expect($socialAccount->provider)->toBe('google');
    expect($socialAccount->provider_id)->toBe('google-123456');

    $this->assertAuthenticatedAs($user);
});

test('oauth callback links social account to existing user with matching email', function () {
    $existingUser = User::factory()->create([
        'email' => 'existing@example.com',
        'name' => 'Alan Turing',
    ]);

    $socialUser = Mockery::mock(SocialiteUser::class);
    $socialUser->shouldReceive('getId')->andReturn('github-987654');
    $socialUser->shouldReceive('getEmail')->andReturn('existing@example.com');
    $socialUser->shouldReceive('getName')->andReturn('Alan Turing');
    $socialUser->shouldReceive('getNickname')->andReturn('aturing');

    $providerMock = Mockery::mock(Provider::class);
    $providerMock->shouldReceive('user')->once()->andReturn($socialUser);

    Socialite::shouldReceive('driver')
        ->with('github')
        ->once()
        ->andReturn($providerMock);

    $response = $this->get(route('social.callback', ['provider' => 'github']));

    $response->assertRedirect(route('dashboard'));

    $socialAccount = SocialAccount::where('user_id', $existingUser->id)->first();
    expect($socialAccount)->not->toBeNull();
    expect($socialAccount->provider)->toBe('github');
    expect($socialAccount->provider_id)->toBe('github-987654');

    $this->assertAuthenticatedAs($existingUser);
});

test('oauth callback logs in existing social account', function () {
    $user = User::factory()->create();
    $socialAccount = SocialAccount::create([
        'user_id' => $user->id,
        'provider' => 'google',
        'provider_id' => 'existing-gid-001',
    ]);

    $socialUser = Mockery::mock(SocialiteUser::class);
    $socialUser->shouldReceive('getId')->andReturn('existing-gid-001');
    $socialUser->shouldReceive('getEmail')->andReturn($user->email);

    $providerMock = Mockery::mock(Provider::class);
    $providerMock->shouldReceive('user')->once()->andReturn($socialUser);

    Socialite::shouldReceive('driver')
        ->with('google')
        ->once()
        ->andReturn($providerMock);

    $response = $this->get(route('social.callback', ['provider' => 'google']));

    $response->assertRedirect(route('dashboard'));
    $this->assertAuthenticatedAs($user);
});
