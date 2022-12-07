<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SttController;
use App\Http\Controllers\ActorGroupController;
use App\Http\Controllers\ActorController;
use App\Http\Controllers\OcrController;


/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

Route::middleware('apikey')->group(function() {
  Route::get('/', function() {
    return response('ok', 200);
  });

  //stts
  Route::post('/stt/search',[SttController::class, 'getSttList']);

  //actorGroup
  Route::post('/actor/group', [ActorGroupController::class, 'postActorGroup']);
  Route::get('/actor/group', [ActorGroupController::class, 'getActorGroupList']);
  Route::get('/actor/group/{id}', [ActorGroupController::class, 'getActorGroup']);
  Route::put('/actor/group/{id}', [ActorGroupController::class, 'updateActorGroup']);
  Route::delete('/actor/group/{id}', [ActorGroupController::class, 'deleteActorGroup']);

  //actor
  Route::get('/actor/group/{groupId}/actors', [ActorController::class, 'getActorList']);
  Route::get('/actor/group/{groupId}/actors/{id}', [ActorController::class, 'getActor']);
  Route::post('/actor/group/{groupId}/actors', [ActorController::class, 'postActor']);
  Route::post('/actor/search', [ActorController::class, 'getActorFromAnalsysServer']);
  Route::delete('/actor/group/{groupId}/actors/{id}', [ActorController::class, 'deleteActor']);

  //ocrs
  Route::post('/ocr/search',[OcrController::class, 'getOcrList']);
});
