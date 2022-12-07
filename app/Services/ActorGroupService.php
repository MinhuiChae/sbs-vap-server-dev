<?php
  namespace App\Services;

  use App\Models\ActorGroup;
  use App\Services\BaseService;
  use DateTime;
  use Illuminate\Support\Facades\Log;

  class ActorGroupService {
    public static $status = 404;

    public static function getActorGroupList() {
      return ActorGroup::all();
    }

    public static function findGroupAtList($id) {
      return ActorGroup::find($id);
    }

    public static function getUpdateActorGroup($id, $toBeUpdatedData) {
      $originData = self::findGroupAtList($id);

      if($originData !== null && $originData->del_yn === 'N') {
        BaseService::updateData($originData, $toBeUpdatedData);
        self::$status = 200;
      } else {
        $originData = null;
      }

      return $originData;
    }

    public static function createActorGroup($request) {
      $name = $request->input('name');
      $actorGroup = ActorGroup::create([
        'name'=>$name, 
        'del_yn'=>'N',
        'create_at'=>new DateTime()
      ]);
      self::$status = 200;

      return $actorGroup;
    }

    public static function getPaginatedActorGroupList($request) {
      $page = $request->page ?? 1;
      $perPage = $request->perPage ?? 10;
      $name = $request->name;
      $groupList = ActorGroup::where('del_yn', 'N');

      if($name === null) {
        $groupList = $groupList -> paginate(
          $perPage,
          ['*'],
          'page',
          $page,
        );
      } else {
        $groupList = $groupList-> where('name', 'like', '%'.$name.'%')->paginate(
          $perPage,
          ['*'],
          'page',
          $page,
        );
      }

      self::$status = 200;
      
      return $groupList;
    }

    public static function getActorGroup($id) {
      $group = self::findGroupAtList($id);
      $group !== null && $group->del_yn === "N" ? self::$status = 200 : $group = null;

      return $group;
    }
  }
?>