<?php

namespace App\Http\Controllers;

use App\Services\ActorGroupService;
use App\Http\Controllers\BaseController;
use Illuminate\Support\Facades\Validator;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ActorGroupController extends Controller
{
  public function postActorGroup(Request $request) {
    $actorGroup = null;
    $validate = Validator::make($request->all(), [
      'name' => 'required'
    ]);

    $validate->fails() === true ? ActorGroupService::$status = 204 : $actorGroup = ActorGroupService::createActorGroup($request);
    $responseMessage = BaseController::getMessage(ActorGroupService::$status);
    $response = BaseController::getResponse($actorGroup, $responseMessage);

    return response()->json($response)
                     ->header('status', ActorGroupService::$status);
  }

  public function getActorGroupList(Request $request) {
    $groupList = ActorGroupService::getPaginatedActorGroupList($request);
    $responseMessage = BaseController::getMessage(ActorGroupService::$status);
    $response = BaseController::getListResponse($groupList, $responseMessage);

    return response()->json($response)
                     ->header('status', ActorGroupService::$status);
  }
 
  public function updateActorGroup($id, Request $request) {
    $actorGroup = null;
    $validate = Validator::make($request->all(), [
      'name' => 'required'
    ]);

    if($validate->fails()){
      ActorGroupService::$status = 204;
    } else {
      $toBeUpdatedData = ['name' => $request->name, 'update_at' => new DateTime()];
      $actorGroup = ActorGroupService::getUpdateActorGroup($id, $toBeUpdatedData);
    }

    $responseMessage = BaseController::getMessage(ActorGroupService::$status);
    $response = BaseController::getResponse($actorGroup, $responseMessage);
    
    return response()->json($response)
                     ->header('status', ActorGroupService::$status);
  }

  public function deleteActorGroup($id) {
    $toBeUpdatedData = ["del_yn" => "Y", "delete_at" => new DateTime()];
    $actorGroup = ActorGroupService::getUpdateActorGroup($id, $toBeUpdatedData);
    $responseMessage = BaseController::getMessage(ActorGroupService::$status);
    $response = BaseController::getResponse($actorGroup, $responseMessage);

    return response()->json($response)
                     ->header('status', ActorGroupService::$status);
  }

  public function getActorGroup($id) {
    $actorGroup = ActorGroupService::getActorGroup($id);
    $responseMessage = BaseController::getMessage(ActorGroupService::$status);
    $response = BaseController::getResponse($actorGroup, $responseMessage);

    return response()->json($response)
                     ->header('status', ActorGroupService::$status);
  }
}