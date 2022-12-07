<?php

namespace App\Http\Controllers;
use App\Enum\ResponseMessage;
use Illuminate\Support\Facades\Log;

class BaseController extends Controller
{
  public static function getListResponse($data, $msg) {
    $success = $data === null ? false : true;
    $total = $data === null ? 0 : $data -> total();
    $perPage = $data === null ? 0 : $data -> perPage();
    $page = $data === null ? 0 : $data -> currentPage();
    $data = $data === null ? null : $data -> items();
    
    $response = [
      "success" => $success,
      "data" => $data,
      "total" => $total,
      "perPage" => $perPage,
      "page" => $page,
      "msg" => $msg
    ];

    return $response;
  }

  public static function getResponse($data, $msg) {
    $success = $data === null ? false : true;
    $response = (object)[
      "success" => $success,
      "data" => $data,
      "msg" => $msg,
    ];

    return $response;
  }

  public static function getMessage($statusCode) {
    $responseMessage = [
      200 => ResponseMessage::SUCCESS,
      204 => ResponseMessage::NULLCONTENT,
      404 => ResponseMessage::NOTFOUND
    ];
    
    return $responseMessage[$statusCode];
  }
}