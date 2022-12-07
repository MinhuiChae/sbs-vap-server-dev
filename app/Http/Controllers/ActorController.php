<?php

namespace App\Http\Controllers;

use DateTime;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\BaseController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Services\ActorService;
use Illuminate\Support\Facades\Http;
use Illuminate\Pagination\LengthAwarePaginator;


class ActorController extends Controller
{
  public function getActorList($groupId, Request $request) {
    $actorList = ActorService::getPaginatedActorList($request, $groupId);
    $responseMessage = BaseController::getMessage(ActorService::$status);
    $response = BaseController::getListResponse($actorList, $responseMessage);

    return response()->json($response)
                     ->header('status', ActorService::$status);
  }

  public function postActor($groupId, Request $request) {
    $actor = null;
    $validate = Validator::make($request->all(), [
      'face_nm' => 'required',
      'image' => 'required'
    ]);

    $validate->fails() === true ? ActorService::$status = 204 : $actor = ActorService::createActor($groupId, $request);
    $responseMessage = BaseController::getMessage(ActorService::$status);
    $response = BaseController::getResponse($actor, $responseMessage);

    return response()->json($response)
                     ->header('status', ActorService::$status);
  }

  public function deleteActor($groupId, $id) {
    $toBeUpdatedData = ["del_yn" => "Y", "delete_at" => new DateTime(), "image" => null];
    $actor = ActorService::getUpdatedActorAfterDelete($groupId, $id, $toBeUpdatedData);
    $responseMessage = BaseController::getMessage(ActorService::$status);
    $response = BaseController::getResponse($actor, $responseMessage);

    return response()->json($response)
                     ->header('status', ActorService::$status);
  }

  public function getActor($groupId, $id) {
    $actor = ActorService::getActor($groupId, $id);
    $responseMessage = BaseController::getMessage(ActorService::$status);
    $response = BaseController::getResponse($actor, $responseMessage);

    return response()->json($response)
                     ->header('status', ActorService::$status);
  }
  
  public function getActorFromAnalsysServer(Request $request) {
    $actor = ActorService::getPaginatedActor($request);
    $responseMessage = BaseController::getMessage(ActorService::$status);
    $response = BaseController::getListResponse($actor, $responseMessage);

    return response()->json($response)
                     ->header('status', ActorService::$status);
  }
}
