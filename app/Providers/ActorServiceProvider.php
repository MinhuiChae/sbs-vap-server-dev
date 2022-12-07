<?php

namespace App\Providers;
use App\Services\ActorService;

use Illuminate\Support\ServiceProvider;

class ActorServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
      $this->app->bind(ActorService::class, function(){
        return new ActorService();
      });
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
