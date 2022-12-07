<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\OcrService;

class OcrServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
      $this->app->bind(SttService::class, function(){
        return new OcrService();
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
