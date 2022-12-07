<?php

namespace App\Http\Controllers;
use Illuminate\Support\Facades\Log;

use Illuminate\Http\Request;
use App\Services\SttService;
use App\Services\BaseService;
use App\Http\Controllers\BaseController;

class SttController extends Controller
{
  public function getSttList(Request $request) {
    $content_ids = $request->input('content_ids');
    $perPage = $request->input('per_page') ?? 20;
    $page = $request->input('page') ?? 1;
    $search_word = $request->input('search_word') ?? '';
    $search_columns = $request->input('search_columns') ?? ["contents"];
    $datas = null;
    $status = 204;
    if (BaseService::isExistContentId($content_ids))
    {
      $queryBuilder = SttService::getSearchQueryBuilder($content_ids, $search_columns, $search_word);
      $datas = BaseService::getListAfterPagination($queryBuilder, $perPage, $page);
      $status = 200;
    }

    $responseMessage = BaseController::getMessage($status);
    $response = BaseController::getListResponse($datas, $responseMessage);

    return response()->json($response)->header('status', $status);
  }
}
