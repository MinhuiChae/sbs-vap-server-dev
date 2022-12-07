<?php

namespace App\Providers;
use App\Services\ActorGroupService;

use Illuminate\Support\ServiceProvider;

class ActorGroupServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
      $this->app->bind(ActorGroupService::class, function(){
        return new ActorGroupService();
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
