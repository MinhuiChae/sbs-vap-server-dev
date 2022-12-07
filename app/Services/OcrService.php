<?php
  namespace App\Services;
  use Illuminate\Support\Facades\Log;
  use App\Models\Ocr;

  class OcrService {
    public static function getSearchQueryBuilder($content_ids, $search_columns, $search_word) {
      $queryBuilder = Ocr::whereIn('content_id', $content_ids);
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