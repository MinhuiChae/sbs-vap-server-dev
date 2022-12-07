<?php
  namespace App\Services;
  use App\Models\Stt;
  use Illuminate\Support\Facades\Log;

  class SttService {
    public static function getSearchQueryBuilder($content_ids, $search_columns, $search_word) {
      $queryBuilder = Stt::whereIn('content_id', $content_ids);
      if ($search_columns && $search_word) {
        $columnCount = 0;
        foreach($search_columns as $column) {
          if ($columnCount === 0) {
            $queryBuilder->where($column, 'like', '%'.$search_word.'%');
          } else {
            $queryBuilder->orWhere($column, 'like', '%'.$search_word.'%');
          }
          $columnCount++;
        }
      }

      return $queryBuilder;
    }
  }

?>