<?php
  namespace App\Services;
  use Illuminate\Support\Facades\Log;

  class BaseService {

    public static function updateData($originData, $toBeUpdatedData) {
      $originData->update($toBeUpdatedData);
    }

    public static function getListAfterPagination($query, $perPage, $page) {
      return $query->paginate(
        $perPage,
        ['*'],
        'page',
        $page,
      );
    }

    public static function isExistContentId($id) {
      return !empty($id) && (is_array($id) || count($id) > 1);
    }
  }
?>