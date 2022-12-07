<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ApikeyAuth
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        $requestApikey = $request->header('apikey');
        if ($this->isAuthApi($requestApikey) === false) {
          return response('Unauthorized', 401)->header('Content-Type', 'text/plain');
        }

        return $next($request);
    }


    private function isAuthApi($requestApikey)
    {
      $appApikey = config('app.api_key');
      return empty($appApikey) || $requestApikey === $appApikey;
    }
}
