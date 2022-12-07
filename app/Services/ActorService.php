<?php
  namespace App\Services;

  use App\Models\Actor;
  use DateTime;
  use App\Services\ActorGroupService;
  use App\Services\BaseService;
  use Illuminate\Support\Facades\Log;
  use Illuminate\Support\Facades\Http;
  use Illuminate\Pagination\LengthAwarePaginator;

  class ActorService {
    public static $status = 404;

    public static function getActorList() {
      return Actor::all();
    }

    public static function findActorsGroupByGroupId($groupId) {
      return Actor::where('g_id', $groupId);
    }

    //수정하기
    public static function getPaginatedActorList($request, $groupId) {
      $page = $request->page ?? 1;
      $perPage = $request->perPage ?? 10;
      $sortDir = $request->sortDir ?? 'asc';
      $name = $request->face_nm;
      $group = ActorGroupService::findGroupAtList($groupId);
      $actorList = null;

      if($group !== null && $group->del_yn === 'N') {
        $actors = self::findActorsGroupByGroupId($groupId)->where('del_yn', 'N');
        if($name!== null) {
          $actors = $actors->where('face_nm', 'like', '%'.$name.'%');
        }

        $actorList = $actors ->orderBy('face_nm', $sortDir)-> paginate(
          $perPage,
          ['*'],
          'page',
          $page,
        );

        self::$status = 200;
      }

      return $actorList;
    }

    public static function getPaginatedActor($request) {
      $content_ids = $request->input('content_ids');
      $face_id = $request->input('face_id');
      $page = $request->input('current_page') ?? 0;
      $per_page = $request->input('per_page') ?? 0;
      $response = Http::timeout(env('ANALYSIS_API_TIME_OUT'))->post(env('ANALYSIS_API_URL').'/postQueryFaceInfos', [
        'content_ids' => $content_ids,
        'face_id' => $face_id,
      ]);

      $response = json_decode($response, true);
      $actorArray = [];

      for($i = 0; $i<count($response); $i++) {
        for($j = 0; $j<count($response[$i]['datas']); $j++) {
          $actor = self::makeActorArray($response[$i]['content_id'], $response[$i]['framerate'], $response[$i]['datas'][$j]);
          array_push($actorArray, $actor);
        }
      };

      if($page === 0 && $per_page === 0) {
        $pagination = new LengthAwarePaginator(
          $actorArray, count($actorArray), count($actorArray), 1
        );
      } else {
        $pagination = new LengthAwarePaginator(
          $response, count($actorArray), $per_page, $page
        );
      }
      
      self::$status = 200;

      return $pagination;
    }

    public static $index = 0;

    public static function makeActorArray($content_id, $framerate, $datas) {
      self::$index = self::$index + 1;
      $data = [
        "id" => self::$index,
        "content_id" => $content_id,
        "framerate" => $framerate,
        "st_frame" => $datas['stFrame'],
        "end_frame" => $datas['endFrame'],
        "confidence" => $datas['confidence']
      ];

      return $data;
    }

    public static function getImageBlob($request) {
      if($file = $request->file('image')) {
        $path = $file->getRealPath();
        $logo = file_get_contents($path);
        $base64 = base64_encode($logo);
      }

      return $base64;
    }

    public static function getFaceIdFromAnalsysServer($name, $file) {
      $response = Http::timeout(env('ANALYSIS_API_TIME_OUT'))->asForm()->post(env('ANALYSIS_API_URL').'/registerFaceData', [
        'name' => $name ,
        'file' => $file,
      ]);
  
      return $response;
    }

    public static function createActor($groupId, $request) {
      $actor = null;
      $group = ActorGroupService::findGroupAtList($groupId);
      $data = self::getFaceIdFromAnalsysServer($request->face_nm, $request->image);
      $face_id = $data['face_id'];
      if($group !== null && $group->del_yn === "N") {
        $actor = Actor::create([
          'g_id'=> $groupId, 
          'del_yn'=>'N',
          'image' => self::getImageBlob($request),
          'face_id' => $face_id,
          'face_nm' => $request->face_nm,
          'create_at' => new DateTime()
        ]);
        self::$status = 200;
      }

      return $actor;
    }

    public static function getActorById($groupId, $id) {
      $actorList = self::findActorsGroupByGroupId($groupId);
      $actor = null;

      if($actorList->first() !== null) {
        $actor = $actorList->where('id', $id)->first();
      } 

      return $actor;
    }

    public static function getUpdatedActorAfterDelete($groupId, $id, $toBeUpdatedData) {
      $originData = self::getActorById($groupId, $id);
      $group = null;
      
      if($originData !== null && $originData->del_yn === 'N') {
        $group = ActorGroupService::findGroupAtList($groupId);
        if($group !== null && $group->del_yn === "N") {
          self::$status = 200;
          BaseService::updateData($originData, $toBeUpdatedData);
        } 
      } else {
        $originData = null;
      }

      return $originData;
    }

    public static function getActor($groupId, $id) {
      $group = ActorGroupService::findGroupAtList($groupId);
      $actor = null;

      if($group !== null && $group->del_yn === "N") {
        $actor = self::getActorById($groupId, $id);
        $actor !== null && $actor->del_yn === 'N' ? self::$status = 200 : $actor = null;
      }

      return $actor;
    }
  }
?>